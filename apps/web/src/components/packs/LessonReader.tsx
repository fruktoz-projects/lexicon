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
          <h2 key={idx} className="text-xl sm:text-2xl font-monument font-bold text-[#1C150D] mt-4 mb-3 border-b border-[#C5A566] pb-2">
            {line.replace('# ', '')}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base sm:text-lg font-monument font-bold text-[#8B5E3C] mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm sm:text-base text-[#1C150D] my-1.5 leading-relaxed font-scribe">
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
          <li key={idx} className="ml-4 list-decimal text-sm sm:text-base text-[#1C150D] my-1.5 leading-relaxed font-scribe">
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
          className="text-sm sm:text-base text-[#1C150D] leading-relaxed my-2 font-scribe"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    });
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#1C150D] font-sans">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic font-scribe text-[#8B5E3C] font-semibold">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-2 py-0.5 rounded-md bg-[#EAD9B8] font-mono text-xs font-bold text-[#1C150D] border border-[#C5A566]">$1</code>');
  };

  return (
    <div className="bg-[#FAF4E6] border-2 border-[#C5A566] rounded-2xl p-5 sm:p-8 shadow-card">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#C5A566]">
        <BookOpen size={20} className="text-[#8B5E3C]" />
        <h3 className="text-base sm:text-lg font-monument font-bold text-[#1C150D]">{title}</h3>
      </div>
      <div className="prose max-w-none text-[#1C150D]">{renderMarkdown(contentMd)}</div>
    </div>
  );
};
