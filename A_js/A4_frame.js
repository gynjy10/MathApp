function paginateContents() {
    const contents = document.querySelector("#contents");
    const initialPage = contents.querySelector(".page");
    const pageHeight = initialPage.offsetHeight; // A4 높이
    let currentPage = initialPage;
    let currentContents = initialPage.querySelector(".page-contents");
  
    // .page-contents의 자식 요소들을 배열로 변환
    const items = Array.from(currentContents.children);
    // 기존 내용 제거
    currentContents.innerHTML = '';
  
    items.forEach(item => {
      currentContents.appendChild(item);
      if (currentPage.scrollHeight > pageHeight) {
        // 현재 페이지를 초과하면 item을 제거하고 새 페이지 생성
        currentContents.removeChild(item);
  
        const newPage = document.createElement("div");
        newPage.classList.add("page");
        const newContents = document.createElement("div");
        newContents.classList.add("page-contents");
  
        newPage.appendChild(newContents);
        contents.appendChild(newPage);
  
        currentPage = newPage;
        currentContents = newContents;
        currentContents.appendChild(item);
      }
    });
  }
  
  window.onload = paginateContents;
  