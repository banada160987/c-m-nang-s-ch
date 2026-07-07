import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

export const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      const id = 'mermaid-svg-' + Math.round(Math.random() * 100000);
      mermaid.render(id, chart).then((result) => {
        if (ref.current) ref.current.innerHTML = result.svg;
      }).catch(e => {
        console.error("Mermaid Render Error", e);
        if (ref.current) ref.current.innerHTML = "<p class='text-red-500'>Lỗi hiển thị sơ đồ tư duy do dữ liệu từ AI không hợp lệ.</p>";
      });
    }
  }, [chart]);

  return <div ref={ref} className="overflow-x-auto p-4 flex justify-center min-h-[200px]" />;
};
