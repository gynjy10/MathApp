// study 페이지 관리

// 서버를 갖추고 모듈화 할때 사용방법 (현재는 import export없이 study.js앞에 링크거는 것으로 해결)
// import { studyCategory} from 'D:/git_repositorys/open_work_space/MathApp/B_data/studyCategory.js';
// import { courseData } from 'D:/git_repositorys/open_work_space/MathApp/B_data/courseData.js';

document.addEventListener("DOMContentLoaded", function() {

  const ySlide = document.getElementById("y-slide");
  let yHtml = "";
  for (const outerCat in studyCategory) {
    yHtml += `<ul class="list-y">${outerCat}`;
    const innerObj = studyCategory[outerCat];
    for (const key in innerObj) {
      yHtml += `<li id="${key}" data-category="${outerCat}">${innerObj[key]}</li>`;
    }
    yHtml += `</ul><div class="interval-y"></div>`;
  }
  ySlide.innerHTML = yHtml;

  // -------------------------------
  // ② 기본 요소 및 초기 상태 설정
  // -------------------------------
  const xCategory = document.getElementById("x-category");
  const studyTitle = document.getElementById("study-title");
  const courseField = document.querySelector('.course');
  const problemField = document.querySelector('.problem');
  const pageDiv = document.querySelector(".page");
  // 초기 상태: 선택 폼 숨김, 결과 영역 보임
  if (courseField) courseField.style.display = "none";
  if (problemField) problemField.style.display = "none";
  if (pageDiv) pageDiv.style.display = "block";

  // -------------------------------
  // ③ 좌측 메뉴 클릭 시 UI 초기화 및 폼 표시
  // -------------------------------
  ySlide.addEventListener("click", function(event) {
    if (event.target.tagName.toLowerCase() === "li") {
      // .course 항목 초기화
      if (courseField) {
        const courseRadios = courseField.querySelectorAll('input[name="course"]');
        courseRadios.forEach(r => r.checked = false);
        const unitSelect = document.getElementById("unit-select");
        if (unitSelect) {
          unitSelect.innerHTML = '<option value="">대단원 선택</option>';
          unitSelect.disabled = true;
        }
        const categoryDiv = document.getElementById("category-checkbox");
        if (categoryDiv) {
          categoryDiv.innerHTML = '';
        }
      }
      // .problem 항목 초기화
      if (problemField) {
        const typeRadios = problemField.querySelectorAll('input[name="type"]');
        typeRadios.forEach(r => r.checked = false);
        const diffCheckboxes = problemField.querySelectorAll('input[name="difficulty"]');
        diffCheckboxes.forEach(c => c.checked = false);
      }
      // ✅ 기존 페이지 초기화 (A4-page 전체 제거)
      const contents = document.querySelector("#contents");
      const allPages = contents.querySelectorAll(".page");
      allPages.forEach((page, idx) => {
        // 첫 번째는 비우고 유지, 나머지는 제거
        if (idx === 0) {
          const pc = page.querySelector(".page-contents");
          if (pc) pc.innerHTML = '';
        } else {
          page.remove();
        }
      });

      // 재초기화: 상단 제목, 선택영역, 확인 버튼 보이고 결과 영역 숨김
      document.getElementById("study-title").style.display = "block";
      const studySelect = document.querySelector(".study-select");
      if (studySelect) studySelect.style.display = "block";
      document.getElementById("confirm-button").style.display = "block";
      if (pageDiv) pageDiv.style.display = "none";

      const target = event.target;
      const selectedId = target.id;
      const selectedText = target.textContent;
      const selectedOuterCat = target.dataset.category;
      xCategory.innerHTML = `<div>${selectedOuterCat}</div><div class="interval-x"></div><div>${selectedText}</div>`;

      // 폼 표시 조건
      const setCourseOnly = ["c-principle", "e-testSupplement", "e-examSimulationSupplement", "e-satSimulationSupplement", "p-learningAnalysis"];
      const setCourseAndProblem = ["c-basic", "c-training", "c-intensive", "e-test", "e-examSimulation", "e-satSimulation"];
      if (setCourseOnly.includes(selectedId)) {
        if (courseField) courseField.style.display = "block";
        if (problemField) problemField.style.display = "none";
      } else if (setCourseAndProblem.includes(selectedId)) {
        if (courseField) courseField.style.display = "block";
        if (problemField) problemField.style.display = "block";
      } else {
        if (courseField) courseField.style.display = "none";
        if (problemField) problemField.style.display = "none";
      }
      studyTitle.textContent = selectedText;

      // 확인 버튼 텍스트 업데이트
      const confirmButton = document.querySelector("#confirm-button button");
      if (confirmButton) {
        if (courseField && courseField.style.display !== "none" && problemField && problemField.style.display !== "none") {
          confirmButton.textContent = "구성하기";
        } else if (courseField && courseField.style.display !== "none") {
          confirmButton.textContent = "선택하기";
        } else {
          confirmButton.textContent = "선택하기 or 구성하기";
        }
      }
    }
  });

  // -------------------------------
  // ④ 과정 선택 및 소단원 구성 (이벤트 리스너)
  // -------------------------------
  const courseRadios = document.querySelectorAll('input[name="course"]');
  const unitSelect = document.getElementById("unit-select");
  const categoryCheckboxDiv = document.getElementById("category-checkbox");
  const courseFieldset = document.querySelector('fieldset.course');
  const unitFieldset = unitSelect ? unitSelect.closest("fieldset") : null;
  const subFieldset = categoryCheckboxDiv ? categoryCheckboxDiv.closest("fieldset") : null;
  let selectedCourseData = [];

  // updateStudyTitle() - 선택된 label의 텍스트를 표시
  function updateStudyTitle() {
    let courseText = "";
    let unitText = "";
    let categoryTexts = [];
    const checkedRadio = document.querySelector('input[name="course"]:checked');
    if (checkedRadio) {
      const labelEl = checkedRadio.previousElementSibling;
      if (labelEl && labelEl.tagName.toLowerCase() === "label") {
        courseText = labelEl.textContent.trim();
      }
    }
    if (unitSelect && unitSelect.value) {
      unitText = unitSelect.options[unitSelect.selectedIndex].textContent.trim();
    }
    const checkedCheckboxes = categoryCheckboxDiv.querySelectorAll('input[type="checkbox"]:checked');
    checkedCheckboxes.forEach(function(chk) {
      categoryTexts.push(chk.parentElement.textContent.trim());
    });
    let titleText = "";
    if (courseText) titleText += courseText;
    if (unitText) titleText += (titleText ? " → " : "") + unitText;
    if (categoryTexts.length > 0) titleText += (titleText ? " → " : "") + categoryTexts.join(", ");
    studyTitle.textContent = titleText || "타이틀....";
  }

  courseRadios.forEach(function(radio) {
    radio.addEventListener("change", function() {
      unitSelect.innerHTML = '<option value="">대단원 선택</option>';
      unitSelect.disabled = true;
      categoryCheckboxDiv.innerHTML = '';
      if (unitFieldset) unitFieldset.classList.remove('selected');
      if (subFieldset) subFieldset.classList.remove('selected');
      updateStudyTitle();

      const courseKey = this.value;
      if (courseData[courseKey]) {
        selectedCourseData = courseData[courseKey];
        let uniqueUnits = {};
        selectedCourseData.forEach(function(item) {
          const unitKey = Object.keys(item.unit)[0];
          const unitVal = Object.values(item.unit)[0];
          if (!uniqueUnits[unitKey]) {
            uniqueUnits[unitKey] = unitVal;
          }
        });
        for (const key in uniqueUnits) {
          const option = document.createElement("option");
          option.value = key;
          option.textContent = uniqueUnits[key];
          unitSelect.appendChild(option);
        }
        unitSelect.disabled = false;
      }
    });
  });

  unitSelect.addEventListener("change", function() {
    categoryCheckboxDiv.innerHTML = '';
    if (subFieldset) subFieldset.classList.remove('selected');
    const selectedUnit = this.value;
    if (selectedUnit && selectedCourseData.length > 0) {
      const matchingItems = selectedCourseData.filter(function(item) {
        return Object.keys(item.unit)[0] === selectedUnit;
      });
      if (unitFieldset) unitFieldset.classList.add('selected');
      matchingItems.forEach(function(item) {
        const sortedKeys = Object.keys(item.category).sort();
        sortedKeys.forEach(function(key) {
          const label = document.createElement("label");
          label.style.display = "block";
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.name = "category";
          checkbox.value = key;
          label.appendChild(checkbox);
          label.appendChild(document.createTextNode(item.category[key]));
          categoryCheckboxDiv.appendChild(label);
        });
      });
    }
    updateStudyTitle();
  });

  categoryCheckboxDiv.addEventListener("change", function() {
    const anyChecked = categoryCheckboxDiv.querySelectorAll('input[type="checkbox"]:checked').length > 0;
    if (subFieldset) {
      if (anyChecked) {
        subFieldset.classList.add('selected');
      } else {
        subFieldset.classList.remove('selected');
      }
    }
    updateStudyTitle();
  });

  // -------------------------------
  // ⑤ 확인 버튼 클릭 시 결과 출력 및 관련 요소 숨김
  // -------------------------------
  document.querySelector("#confirm-button").addEventListener("click", function(event) {
    event.preventDefault();

    let courseCodes = [];
    let problemCodes = [];

    if (courseField && courseField.style.display !== "none") {
      const unitKey = document.getElementById("unit-select").value;
      const checkedCategories = document.querySelectorAll("#category-checkbox input[type='checkbox']:checked");
      checkedCategories.forEach(function(chk) {
        courseCodes.push(unitKey + chk.value);
      });
    }

    if (problemField && problemField.style.display !== "none") {
      const selectedType = document.querySelector("input[name='type']:checked");
      if (selectedType) {
        const typeVal = selectedType.value;
        const checkedDifficulties = document.querySelectorAll("input[name='difficulty']:checked");
        checkedDifficulties.forEach(function(chk) {
          problemCodes.push(typeVal + chk.value);
        });
      }
    }

    // 콜솔로 선택된 코드확인하는 부분 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    console.log("courseCodes:", courseCodes, "problemCodes:", problemCodes);

    const questionCount = parseInt(document.getElementById("questionCount").value, 10);
    const pageContents = document.querySelector(".page-contents");
    pageContents.innerHTML = "";

    // ⑤-1. courseCodes만 있을 경우: 모든 이미지출력
    if (courseCodes.length > 0 && problemCodes.length === 0) {
      const allImageElements = [];
      const imageLoadPromises = [];

      courseCodes.forEach(function(code) {
        const unitKey = code.substring(0, 2);
        const categoryKey = code.substring(2, 4);
        const fileList = principleImageID[unitKey] || [];
      
        const matchingFiles = fileList.filter(file => file.startsWith(code));
        matchingFiles.forEach(file => {
          const wrapperDiv = document.createElement("div");
          const img = document.createElement("img");
          img.src = "https://storage.googleapis.com/mathproblemdb-9f42d.firebasestorage.app/mathproblem_high_principleData/" + file;
      
          const imgLoadPromise = new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
      
          imageLoadPromises.push(imgLoadPromise);
          wrapperDiv.appendChild(img);
          allImageElements.push(wrapperDiv); // 🔴 DOM에 바로 추가하지 않음
        });
      });
      
      Promise.all(imageLoadPromises).then(() => {
        allImageElements.forEach(el => pageContents.appendChild(el)); // ✅ 한 번에 추가
        paginateContents();
      });
    }

    // ⑤-2. courseCodes와 problemCodes 모두 있을 경우: Firestore 실데이터 호출
    if (courseCodes.length > 0 && problemCodes.length > 0) {
      const combinedCodes = [];
      courseCodes.forEach(cCode => {
        problemCodes.forEach(pCode => {
          combinedCodes.push(cCode + pCode);
        });
      });

      // 문제 ID를 기준으로 필터링된 실제 문제 코드 추출
      const questionCount = parseInt(document.getElementById("questionCount").value, 10);
      const matchingProblemCodes = [];

      combinedCodes.forEach(prefix => {
        const unitKey = prefix.substring(0, 2);
        const allProblems = problemID[unitKey] || [];

        const matches = allProblems.filter(code => code.startsWith(prefix));
        matchingProblemCodes.push(...matches);
      });

      // 랜덤하게 questionCount만큼 선택
      const selectedCodes = [];
      const usedIndices = new Set();

      while (selectedCodes.length < questionCount && usedIndices.size < matchingProblemCodes.length) {
        const randIdx = Math.floor(Math.random() * matchingProblemCodes.length);
        if (!usedIndices.has(randIdx)) {
          usedIndices.add(randIdx);
          selectedCodes.push(matchingProblemCodes[randIdx]);
        }
      }

      const pageContents = document.querySelector(".page-contents");
      pageContents.innerHTML = "";

      // Firestore에서 문제 데이터 가져오기
      const fetchPromises = selectedCodes.map(fullCode => {
        const unitKey = fullCode.substring(0, 2);
        const categoryKey = fullCode.substring(2, 4);

        // unit 이름 조회 (courseData.js 활용)
        let unitName = "", categoryName = "";
        outer: for (const courseKey in courseData) {
          for (const item of courseData[courseKey]) {
            const uKey = Object.keys(item.unit)[0];
            const uVal = Object.values(item.unit)[0];
            if (uKey === unitKey) {
              unitName = uVal;
              if (item.category[categoryKey]) {
                categoryName = item.category[categoryKey];
                break outer;
              }
            }
          }
        }

        const unitDocId = `${unitKey}_${unitName}`;
        const categoryDocId = `${categoryKey}_${categoryName}`;
        const problemDocId = fullCode;

        return db
          .collection("high_units")
          .doc(unitDocId)
          .collection("contents")
          .doc(categoryDocId)
          .collection("problems")
          .doc(problemDocId)
          .get()
          .then(doc => {
            if (doc.exists) {
              const data = doc.data();
              return { code: problemDocId, html_Q: data.html_Q, html_A: data.html_A };
            }
            return null;
          });
      });
      
      Promise.all(fetchPromises)
      .then(results => {
        results.forEach(item => {
          if (item) {
            const wrapper = document.createElement("div");
            wrapper.id = item.code;
    
            // 제목 텍스트
            wrapper.textContent = "문제" + item.code;
    
            // 첫 번째 구분자???????????????????????????작동안하는듯....???????????????
            const span1 = document.createElement("span");
            span1.className = "interval-y";
            wrapper.appendChild(span1);
    
            // 문제 내용
            const divQ = document.createElement("div");
            divQ.className = "html_Q";
            divQ.innerHTML = item.html_Q || "";
            wrapper.appendChild(divQ);
    
            // 두 번째 구분자
            const span2 = document.createElement("span");
            span2.className = "interval-y";
            wrapper.appendChild(span2);
    
            // 정답 내용
            const divA = document.createElement("div");
            divA.className = "html_A";
            divA.innerHTML = item.html_A || "";
            wrapper.appendChild(divA);
    
            // 마지막 구분자
            const span3 = document.createElement("span");
            span3.className = "interval-y";
            wrapper.appendChild(span3);
    
            pageContents.appendChild(wrapper);
          }
        });  
        MathJax.typeset(); // 수식 렌더링
        paginateContents(); // A4 분할
      })
      .catch(error => {
        console.error("문제 데이터 로딩 실패:", error);
      });
    }
    // ✅ UI 전환
    document.getElementById("study-title").style.display = "none";
    const studySelect = document.querySelector(".study-select");
    if (studySelect) studySelect.style.display = "none";
    document.getElementById("confirm-button").style.display = "none";
    if (pageDiv) pageDiv.style.display = "block";
  });
});

// A4_frame 제작하는 함수
function paginateContents() {
  const contents = document.querySelector("#contents");
  const pages = Array.from(contents.querySelectorAll(".page"));
  const pageHeight = pages[0].offsetHeight;

  // 모든 요소 수집
  const allItems = [];
  pages.forEach(page => {
    const pc = page.querySelector(".page-contents");
    if (pc) {
      allItems.push(...Array.from(pc.children));
    }
  });

  // 모든 페이지 제거
  pages.forEach(page => page.remove());

  // 새 페이지로 분배
  let currentPage = document.createElement("div");
  currentPage.classList.add("page");
  let currentContents = document.createElement("div");
  currentContents.classList.add("page-contents");
  currentPage.appendChild(currentContents);
  contents.appendChild(currentPage);

  allItems.forEach(item => {
    currentContents.appendChild(item);
    if (currentPage.scrollHeight > pageHeight) {
      currentContents.removeChild(item);

      currentPage = document.createElement("div");
      currentPage.classList.add("page");
      currentContents = document.createElement("div");
      currentContents.classList.add("page-contents");
      currentPage.appendChild(currentContents);
      contents.appendChild(currentPage);

      currentContents.appendChild(item);
    }
  });
}