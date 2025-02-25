function paginateContent() {
    const content = document.querySelector("#content");
    const initialPage = content.querySelector(".page");
    const pageHeight = initialPage.offsetHeight; // A4 높이
    let currentPage = initialPage;
    let currentContent = initialPage.querySelector(".page-content");
  
    // .page-content의 자식 요소들을 배열로 변환
    const items = Array.from(currentContent.children);
    // 기존 내용 제거
    currentContent.innerHTML = '';
  
    items.forEach(item => {
      currentContent.appendChild(item);
      if (currentPage.scrollHeight > pageHeight) {
        // 현재 페이지를 초과하면 item을 제거하고 새 페이지 생성
        currentContent.removeChild(item);
  
        const newPage = document.createElement("div");
        newPage.classList.add("page");
        const newContent = document.createElement("div");
        newContent.classList.add("page-content");
  
        newPage.appendChild(newContent);
        content.appendChild(newPage);
  
        currentPage = newPage;
        currentContent = newContent;
        currentContent.appendChild(item);
      }
    });
  }
  
  window.onload = paginateContent;
  