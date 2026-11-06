// ═══════════════════════════════════════════════════════════
// SihhaTek — API Route pour Mistral AI (Next.js App Router)
// Streaming SSE pour affichage progressif dans le frontend
// ═══════════════════════════════════════════════════════════

export async function POST(request) {
    const { systemPrompt, userMessage, patientContext } = await request.json();

    // Provider is configurable: any OpenAI-compatible endpoint works, which lets
    // the doctor side run fully local (e.g. Ollama: LLM_BASE_URL=http://localhost:11434/v1).
    // Without LLM_BASE_URL we fall back to the Mistral cloud API.
    const baseUrl = (process.env.LLM_BASE_URL || 'https://api.mistral.ai/v1').replace(/\/$/, '');
    const isLocal = Boolean(process.env.LLM_BASE_URL);
    const model = process.env.LLM_MODEL || process.env.MISTRAL_MODEL || 'mistral-small-latest';
    const apiKey = process.env.LLM_API_KEY || process.env.MISTRAL_API_KEY;
    if (!isLocal && (!apiKey || apiKey === 'YOUR_KEY_HERE')) {
        return Response.json(
            { error: 'Aucun LLM configure. Ajoutez MISTRAL_API_KEY ou LLM_BASE_URL (LLM local) dans .env.local' },
            { status: 500 }
        );
    }

    // Build messages array with RAG context injected
    const messages = [
        {
            role: 'system',
            content: `${systemPrompt}\n\n${patientContext}`
        },
        {
            role: 'user',
            content: userMessage
        }
    ];

    try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
            },
            body: JSON.stringify({
                model,
                messages,
                stream: true,
                max_tokens: 2000,
                temperature: 0.3, // Low temp = less hallucination
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            return Response.json(
                { error: `Erreur API LLM (${response.status}): ${errText}` },
                { status: response.status }
            );
        }

        // Stream the response back to the client
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';

                        for (const line of lines) {
                            if (!line.startsWith('data: ')) continue;
                            const data = line.slice(6).trim();
                            if (data === '[DONE]') continue;

                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices?.[0]?.delta?.content;
                                if (content) {
                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                                }
                            } catch {
                                // Skip unparseable chunks
                            }
                        }
                    }
                } catch (err) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`));
                } finally {
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                }
            }
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        });

    } catch (err) {
        return Response.json(
            { error: `Erreur de connexion: ${err.message}` },
            { status: 500 }
        );
    }
}
