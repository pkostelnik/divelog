import type { SVGProps } from "react";

export type SocialProviderId = "google" | "microsoft" | "facebook" | "linkedin" | "amazon";

type SocialProvider = {
  id: SocialProviderId;
  label: string;
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.78-.07-1.53-.2-2.27H12v4.3h6.45c-.28 1.5-1.1 2.77-2.35 3.63v3h3.8c2.23-2.06 3.49-5.1 3.49-8.66z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.15 0 5.8-1.04 7.73-2.81l-3.8-3c-1.06.72-2.42 1.14-3.93 1.14-3.02 0-5.57-2.04-6.48-4.79H1.57v3.02C3.49 21.53 7.39 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.52 14.54A7.2 7.2 0 0 1 5.16 12c0-.88.15-1.73.36-2.54V6.44H1.57A11.96 11.96 0 0 0 0 12c0 1.9.45 3.7 1.57 5.56l3.95-3.02z"
      />
      <path
        fill="#EA4335"
        d="M12 4.74c1.71 0 3.24.6 4.45 1.78l3.33-3.32C17.78 1.23 15.15 0 12 0 7.39 0 3.49 2.47 1.57 6.44l3.95 3.02C6.43 6.78 8.98 4.74 12 4.74z"
      />
    </svg>
  );
}

function MicrosoftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
      <rect fill="#F25022" x="2" y="2" width="9.5" height="9.5" rx="1.2" />
      <rect fill="#7FBA00" x="12.5" y="2" width="9.5" height="9.5" rx="1.2" />
      <rect fill="#00A4EF" x="2" y="12.5" width="9.5" height="9.5" rx="1.2" />
      <rect fill="#FFB900" x="12.5" y="12.5" width="9.5" height="9.5" rx="1.2" />
    </svg>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
      <path
        fill="#1877F2"
        d="M12 0C5.37 0 0 5.37 0 12c0 5.99 4.39 10.95 10.13 11.85v-8.39H7.08V12h3.05V9.62c0-3 1.79-4.66 4.53-4.66 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.96.92-1.96 1.87V12h3.33l-.53 3.46h-2.8v8.39C19.61 22.95 24 17.99 24 12c0-6.63-5.37-12-12-12z"
      />
      <path
        fill="#fff"
        d="M16.47 15.46 17 12h-3.33V9.97c0-.95.47-1.87 1.96-1.87h1.51V5.14s-1.37-.24-2.68-.24c-2.74 0-4.53 1.66-4.53 4.66V12H7.08v3.46h3.85v8.39c.36.06.73.09 1.1.09s.74-.03 1.1-.09v-8.39h2.8z"
      />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
      <rect fill="#0A66C2" x="1" y="1" width="22" height="22" rx="4" />
      <path
        fill="#fff"
        d="M7.16 9.75H4.24v10.5h2.92V9.75zm-.15-3.32c0-.94-.71-1.7-1.84-1.7s-1.85.76-1.85 1.7c0 .93.72 1.69 1.82 1.69h.02c1.13 0 1.85-.76 1.85-1.69zM20 20.25v-6.02c0-3.23-1.72-4.73-4.02-4.73-1.85 0-2.67 1.02-3.13 1.74v-1.49H9.98c.04.98 0 10.5 0 10.5h2.87v-5.86c0-.31.02-.63.12-.85.27-.63.87-1.28 1.88-1.28 1.33 0 1.87 1 1.87 2.46v5.53H20z"
      />
    </svg>
  );
}

function AmazonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
      <rect fill="#232F3E" x="1" y="1" width="22" height="22" rx="4" />
      <path
        fill="#fff"
        d="M12.63 6.5c-1.41 0-2.56.64-3.2 1.8-.25.46-.37.88-.37 1.66 0 1.08.5 2.07 1.31 2.49.59.31.87.37 1.76.46 1.08.13 1.31.2 1.31.55 0 .5-.65.74-1.97.74-1.18 0-1.93-.15-2.87-.67-.26-.14-.46-.2-.57-.2-.29 0-.53.24-.53.55 0 .37.18.62.62.92.95.64 2.12.94 3.76.94 2.62 0 4.3-.95 4.3-2.47 0-.77-.33-1.32-.99-1.68-.52-.29-.92-.4-2.12-.51-1.04-.09-1.22-.13-1.57-.28-.46-.22-.7-.59-.7-1.12 0-.85.7-1.45 1.74-1.45.73 0 1.26.2 1.8.67.17.13.28.18.4.18.29 0 .53-.24.53-.55 0-.2-.07-.33-.24-.51-.57-.61-1.51-.98-2.6-.98z"
      />
      <path
        fill="#FF9900"
        d="M4.91 16.82c2.6 2.08 6.37 2.46 9.34 1.32 1.14-.44 2.12-1.07 2.89-1.79.32-.29-.04-.82-.45-.61-4.51 2.23-9.99 1.64-13.23-.99-.36-.29-.84.16-.58.52.36.48 1 .98 1.48 1.55.18.21.33.28.55 0z"
      />
    </svg>
  );
}

export const socialProviders: SocialProvider[] = [
  { id: "google", label: "Google", Icon: GoogleIcon },
  { id: "microsoft", label: "Microsoft", Icon: MicrosoftIcon },
  { id: "facebook", label: "Facebook", Icon: FacebookIcon },
  { id: "linkedin", label: "LinkedIn", Icon: LinkedInIcon },
  { id: "amazon", label: "Amazon", Icon: AmazonIcon }
];
