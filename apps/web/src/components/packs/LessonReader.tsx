import React from 'react';
import { BookOpen } from 'lucide-react';

interface LessonReaderProps {
  title: string;
  contentMd: string;
}

export const LessonReader: React.FC<LessonReaderProps> = ({ title, contentMd }) => {
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-xl sm:text-2xl font-monument font-bold text-ink mt-4 mb-3 border-b border-border pb-2">
            {line.replace('# ', '')}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base sm:text-lg font-monument font-bold text-accent mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm sm:text-base text-ink my-1.5 leading-relaxed font-scribe">
            <span
              dangerouslySetInnerHTML={{
                __html: formatInline(line.replace('- ', '')),
              }}
            />
          </li>
        );
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
        return (
          <li key={idx} className="ml-4 list-decimal text-sm sm:text-base text-ink my-1.5 leading-relaxed font-scribe">
            <span
              dangerouslySetInnerHTML={{
                __html: formatInline(line.replace(/^\d+\.\s*/, '')),
              }}
            />
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p
          key={idx}
          className="text-sm sm:text-base text-ink leading-relaxed my-2 font-scribe"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    });
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-ink font-sans">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic font-scribe text-accent font-semibold">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-2 py-0.5 rounded-md bg-surface-subtle font-mono text-xs font-bold text-ink border border-border">$1</code>');
  };

  return (
    <div className="bg-surface-subtle border-2 border-border rounded-2xl p-5 sm:p-8 shadow-card">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <BookOpen size={20} className="text-accent" />
        <h3 className="text-base sm:text-lg font-monument font-bold text-ink">{title}</h3>
      </div>
      <div className="prose max-w-none text-ink">{renderMarkdown(contentMd)}</div>
    </div>
  );
};
