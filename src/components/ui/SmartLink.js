'use client';
import Link from 'next/link';

/* Internal paths use next/link, everything else is a plain anchor. */
export default function SmartLink({ href, children, ...rest }) {
    if (typeof href === 'string' && href.startsWith('/')) {
        return <Link href={href} {...rest}>{children}</Link>;
    }
    return <a href={href} {...rest}>{children}</a>;
}
