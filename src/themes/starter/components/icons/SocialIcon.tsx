import type { SVGProps } from "react";

type SocialIconProps = SVGProps<SVGSVGElement> & {
  iconKey: string;
};

function SocialIcon({ iconKey, ...props }: SocialIconProps) {
  const key = iconKey.toLowerCase();

  if (key === "instagram") {
    return <InstagramIcon {...props} />;
  }

  if (key === "youtube") {
    return <YouTubeIcon {...props} />;
  }

  if (key === "tiktok") {
    return <TikTokIcon {...props} />;
  }

  if (key === "facebook") {
    return <FacebookIcon {...props} />;
  }

  if (key === "linkedin") {
    return <LinkedInIcon {...props} />;
  }

  if (key === "line") {
    return <LineIcon {...props} />;
  }

  return <ExternalLinkIcon {...props} />;
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
    </svg>
  );
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 2c.3 2.8 1.9 4.5 4.6 4.7v4.1a8 8 0 0 1-4.5-1.4v6.6c0 4.2-2.5 6.9-6.4 6.9-3.5 0-6.3-2.6-6.3-6.1 0-3.8 2.9-6.5 6.8-6.2v4.2c-1.7-.3-2.8.5-2.8 2 0 1.2 1 2.1 2.2 2.1 1.5 0 2.4-.9 2.4-3V2h4Z" />
    </svg>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1c0 6 4.4 11 10.1 11.9v-8.4h-3v-3.5h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.3h3.4l-.5 3.5h-2.9V24c5.8-.9 10.2-5.9 10.2-11.9Z" />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.4 20.4h-3.6v-5.7c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3v5.8H9.1V8.8h3.4v1.6h.1a3.8 3.8 0 0 1 3.4-1.9c3.7 0 4.4 2.4 4.4 5.6v6.3ZM5 7.2a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2Zm1.8 13.2H3.2V8.8h3.6v11.6ZM22.2 0H1.8C.8 0 0 .8 0 1.8v20.4c0 1 .8 1.8 1.8 1.8h20.4c1 0 1.8-.8 1.8-1.8V1.8c0-1-.8-1.8-1.8-1.8Z" />
    </svg>
  );
}

function LineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5C5.9 2.5 1 6.5 1 11.4c0 4.4 3.9 8.1 9.2 8.8.4.1.9.3 1 .7.1.3.1.7 0 1 0 0-.1.8-.2 1-.1.3-.4 1.1 1 .6s7.5-4.4 10.2-7.5A7.8 7.8 0 0 0 23 11.4c0-4.9-4.9-8.9-11-8.9Zm-3.5 11H6V9.2h1.1v3.3h1.4v1Zm2.1 0H9.5V9.2h1.1v4.3Zm5 0h-1.1l-1.9-2.6v2.6h-1.1V9.2h1.1l1.9 2.6V9.2h1.1v4.3Zm3.6-3.3h-1.8v.6h1.8v1h-1.8v.7h1.8v1h-2.9V9.2h2.9v1Z" />
    </svg>
  );
}

function ExternalLinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export { SocialIcon };
