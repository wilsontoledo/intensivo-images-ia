import { isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { slugify } from "@/lib/utils";

type MarkdownRendererProps = {
  content: string;
};

function getPlainText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getPlainText).join("");
  }

  if (isValidElement(node)) {
    return getPlainText((node.props as { children?: ReactNode }).children);
  }

  return "";
}

const components: Components = {
  h2: ({ children, ...props }) => {
    const id = slugify(getPlainText(children));
    return (
      <h2 id={id} className="mt-12 scroll-mt-24 text-2xl font-semibold tracking-tight text-white" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }) => {
    const id = slugify(getPlainText(children));
    return (
      <h3 id={id} className="mt-8 scroll-mt-24 text-xl font-semibold text-slate-100" {...props}>
        {children}
      </h3>
    );
  },
  p: ({ children, ...props }) => (
    <p className="mt-4 leading-8 text-slate-300" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-300 marker:text-sky-300" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-300 marker:text-sky-300" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => <li {...props}>{children}</li>,
  hr: (props) => <hr className="my-10 border-white/10" {...props} />,
  code: ({ children, className, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[0.92em] text-sky-200"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <code
        className="block overflow-x-auto rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-200"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950" {...props}>
      {children}
    </pre>
  ),
  a: ({ children, ...props }) => (
    <a className="text-sky-300 underline decoration-sky-500/40 underline-offset-4 hover:text-sky-200" {...props}>
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="mt-6 border-l-2 border-sky-400/60 pl-4 text-slate-300" {...props}>
      {children}
    </blockquote>
  ),
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown>;
}
