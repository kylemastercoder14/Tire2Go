"use client";

import parse, { domToReact, Element, Text } from "html-react-parser";

export default function ArticleContent({ html }: { html: string }) {
  if (!html || typeof html !== "string") return null;

  return (
    <div
      className="prose prose-lg max-w-none
        prose-headings:font-bold
        prose-headings:text-primary
        prose-a:text-blue-600 prose-a:underline
        prose-ul:list-disc prose-ol:list-decimal
        prose-li:marker:text-primary"
    >
      {parse(html, {
        replace: (domNode) => {
          if (domNode.type === "tag") {
            const el = domNode as Element;

            // ✅ Custom rendering for <img>
            if (el.name === "img" && el.attribs) {
              return (
                <img
                  src={el.attribs.src}
                  alt={el.attribs.alt || ""}
                  className="rounded-lg my-4"
                />
              );
            }

            // ✅ Custom rendering for <a>
            if (el.name === "a" && el.attribs) {
              return (
                <a
                  href={el.attribs.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {domToReact(el.children)}
                </a>
              );
            }

            // ✅ Ensure <ul>, <ol>, <li> keep styles
            if (["ul", "ol", "li"].includes(el.name)) {
              return (
                <el.name className="list-inside">
                  {domToReact(el.children)}
                </el.name>
              );
            }

            // ✅ Optional: <blockquote>
            if (el.name === "blockquote") {
              return (
                <blockquote className="border-l-4 border-gray-300 pl-4 italic">
                  {domToReact(el.children)}
                </blockquote>
              );
            }

            // ✅ Optional: <hr>
            if (el.name === "hr") {
              return <hr className="my-6 border-t border-gray-300" />;
            }
          }

          return undefined; // fallback to default rendering
        },
      })}
    </div>
  );
}
