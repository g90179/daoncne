// daon-frontend/src/pages/admin/AdminStampTool.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import api from '../../api/axios';
import { API_URL } from '../../config';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const AdminStampTool = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // ✨ [변경] 도장 크기를 9%로 고정 (더 이상 조절 불가)
  const STAMP_WIDTH_PCT = 9;

  // 도장 위치: 캔버스(=페이지) 대비 퍼센트 좌표, 도장 중심점 기준
  const [stampPos, setStampPos] = useState({ xPct: 70, yPct: 80, widthPct: STAMP_WIDTH_PCT });
  const [placements, setPlacements] = useState([]); // 여러 페이지/여러 위치에 찍을 목록
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startPos: null });

  // PDF 파일 로드
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    setPlacements([]);

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const doc = await loadingTask.promise;
    setPdfDoc(doc);
    setNumPages(doc.numPages);
    setCurrentPage(1);
  };

  // 현재 페이지를 캔버스에 렌더링
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;
    const page = await pdfDoc.getPage(currentPage);
    const containerWidth = containerRef.current?.clientWidth || 600;
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = containerWidth / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    setCanvasSize({ width: viewport.width, height: viewport.height });

    await page.render({ canvasContext: ctx, viewport }).promise;
  }, [pdfDoc, currentPage]);

  useEffect(() => { renderPage(); }, [renderPage]);

  // ✨ [신규] 마우스/터치 이벤트에서 좌표를 통일해서 꺼내는 헬퍼
  const getPointFromEvent = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  // ✨ [변경] 마우스 드래그 시작
  const handleStampMouseDown = (e) => {
    e.preventDefault();
    const point = getPointFromEvent(e);
    dragRef.current = {
      dragging: true,
      startX: point.x,
      startY: point.y,
      startPos: { ...stampPos },
    };
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
  };

  // ✨ [신규] 터치 드래그 시작 (모바일)
  const handleStampTouchStart = (e) => {
    // preventDefault로 페이지 스크롤이 함께 일어나는 걸 막음
    e.preventDefault();
    const point = getPointFromEvent(e);
    dragRef.current = {
      dragging: true,
      startX: point.x,
      startY: point.y,
      startPos: { ...stampPos },
    };
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('touchcancel', handleDragEnd);
  };

  // ✨ [변경] 이동 처리 (마우스/터치 공용)
  const handleDragMove = (e) => {
    if (!dragRef.current.dragging || !canvasSize.width) return;
    if (e.type === 'touchmove') e.preventDefault(); // 드래그 중 배경 스크롤 방지

    const point = getPointFromEvent(e);
    const dx = point.x - dragRef.current.startX;
    const dy = point.y - dragRef.current.startY;
    const dxPct = (dx / canvasSize.width) * 100;
    const dyPct = (dy / canvasSize.height) * 100;

    setStampPos(prev => ({
      ...prev,
      xPct: Math.min(100, Math.max(0, dragRef.current.startPos.xPct + dxPct)),
      yPct: Math.min(100, Math.max(0, dragRef.current.startPos.yPct + dyPct)),
    }));
  };

  // ✨ [변경] 드래그 종료 (마우스/터치 리스너 모두 정리)
  const handleDragEnd = () => {
    dragRef.current.dragging = false;
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchmove', handleDragMove);
    window.removeEventListener('touchend', handleDragEnd);
    window.removeEventListener('touchcancel', handleDragEnd);
  };

  // 현재 페이지에 이 위치를 도장 목록에 추가
  const handleAddPlacement = () => {
    setPlacements(prev => [
      ...prev.filter(p => p.page !== currentPage - 1), // 같은 페이지는 하나로 대체
      { page: currentPage - 1, ...stampPos },
    ]);
    alert(`${currentPage}페이지에 도장 위치가 지정되었습니다.`);
  };

  const handleRemovePlacement = (page) => {
    setPlacements(prev => prev.filter(p => p.page !== page));
  };

  const handleApplyAndDownload = async () => {
    if (!pdfFile) return alert('계약서 PDF를 먼저 선택해주세요.');
    if (placements.length === 0) return alert('도장을 찍을 위치를 최소 1곳 이상 지정해주세요.');

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('contract', pdfFile);
      formData.append('placements', JSON.stringify(placements));

      const response = await api.post('/stamp/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });

      const blobUrl = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = pdfFile.name.replace(/\.pdf$/i, '') + '_도장.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      alert('도장 적용에 실패했습니다: ' + (err.response?.data?.message || '서버 오류'));
    } finally {
      setIsProcessing(false);
    }
  };

  const stampBoxStyle = {
    left: `${stampPos.xPct}%`,
    top: `${stampPos.yPct}%`,
    width: `${stampPos.widthPct}%`,
    transform: 'translate(-50%, -50%)',
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn space-y-6">
      <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white/70 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-800">📄 전자 도장 찍기</h2>
        <p className="text-xs text-slate-400">
          계약서 PDF를 업로드하고, 도장을 원하는 위치로 드래그한 뒤 크기를 조절해서 적용하세요.
        </p>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="block text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white file:hover:bg-blue-500 file:transition file:cursor-pointer"
        />
      </div>

      {pdfDoc && (
        <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white/70 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="text-xs font-bold px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
              >
                ← 이전
              </button>
              <span className="text-xs font-bold text-slate-600">{currentPage} / {numPages} 페이지</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                disabled={currentPage >= numPages}
                className="text-xs font-bold px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
              >
                다음 →
              </button>
            </div>
            {placements.some(p => p.page === currentPage - 1) && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                ✔ 이 페이지에 도장 위치 지정됨
              </span>
            )}
          </div>

          {/* 도장 크기 조절 슬라이더 */}
          {/* <div className="flex items-center gap-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">도장 크기</label>
            <input
              type="range"
              min="5"
              max="40"
              value={stampPos.widthPct}
              onChange={(e) => setStampPos(prev => ({ ...prev, widthPct: Number(e.target.value) }))}
              className="flex-1 cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-500 w-10">{stampPos.widthPct}%</span>
          </div> */}

          {/* PDF 미리보기 + 드래그 가능한 도장 오버레이 */}
          <div ref={containerRef} className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
            <canvas ref={canvasRef} className="block w-full" />
            <img
              src={`${API_URL}/stamp/seal-image`}
              alt="도장"
              onMouseDown={handleStampMouseDown}
              onTouchStart={handleStampTouchStart}
              className="absolute cursor-move select-none pointer-events-auto opacity-90 hover:opacity-100 transition-opacity"
              style={stampBoxStyle}
              draggable={false}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddPlacement}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              📌 현재 페이지에 이 위치로 지정
            </button>
          </div>
        </div>
      )}

      {placements.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white/70 shadow-sm space-y-3">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">지정된 도장 위치 목록</h3>
          <div className="space-y-2">
            {placements.sort((a, b) => a.page - b.page).map(p => (
              <div key={p.page} className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl text-xs">
                <span className="font-bold text-slate-700">{p.page + 1}페이지</span>
                <span className="text-slate-400">크기 {p.widthPct}%</span>
                <button
                  onClick={() => handleRemovePlacement(p.page)}
                  className="text-rose-500 hover:text-rose-600 font-bold cursor-pointer"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleApplyAndDownload}
            disabled={isProcessing}
            className="w-full bg-neutral-900 hover:bg-blue-500 text-white text-sm font-bold py-3.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isProcessing ? '도장 적용 중...' : '🖋️ 도장 찍고 PDF 다운로드'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminStampTool;