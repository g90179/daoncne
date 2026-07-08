// daon-frontend/src/components/Pagination.jsx
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const PAGE_GROUP_SIZE = 5;
  const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
  const startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
  const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // 🔑 커서 스타일 추가: 클릭 가능하면 pointer, 현재 페이지는 default
  const baseStyle = "w-8 h-8 flex items-center justify-center text-xs font-bold transition-colors duration-200";
  const clickableStyle = "cursor-pointer text-neutral-400 hover:text-blue-400";
  const activeStyle = "cursor-default text-blue-400";
  const disabledStyle = "opacity-20 cursor-default";

  return (
    <div className="flex items-center justify-center space-x-2 mt-10 mb-6 select-none animate-fadeIn">
      {/* 1. 처음으로 */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`${baseStyle} ${currentPage === 1 ? disabledStyle : clickableStyle}`}
      >
        &lt;&lt;
      </button>

      {/* 2. 이전 */}
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`${baseStyle} ${currentPage === 1 ? disabledStyle : clickableStyle}`}
      >
        &lt;
      </button>

      {/* 3. 페이지 번호 */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${baseStyle} ${currentPage === page ? activeStyle : clickableStyle}`}
        >
          {page}
        </button>
      ))}

      {/* 4. 다음 */}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`${baseStyle} ${currentPage === totalPages ? disabledStyle : clickableStyle}`}
      >
        &gt;
      </button>

      {/* 5. 끝으로 */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`${baseStyle} ${currentPage === totalPages ? disabledStyle : clickableStyle}`}
      >
        &gt;&gt;
      </button>
    </div>
  );
};

export default Pagination;