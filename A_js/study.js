// study 페이지 관리

// 서버를 갖추고 모듈화 할때 사용방법 (현재는 import export없이 study.js앞에 링크거는 것으로 해결)
// import { studyCategory} from 'D:/git_repositorys/open_work_space/MathApp/B_data/studyCategory.js';
// import { courseData } from 'D:/git_repositorys/open_work_space/MathApp/B_data/courseData.js';

// study.js
// 템플릿 기반으로 study.html의 #contents 영역을 동적으로 구성
// 변경된 부분과 주석을 자세히 포함한 예시코드

document.addEventListener("DOMContentLoaded", function() {

  //-----------------------------------
  // 0. 템플릿 및 기본 DOM 요소 가져오기
  //-----------------------------------
  // study.html에서 <template id="study-title">, <template id="study-select">, <template id="confirm-button">, <template class="page">를 미리 준비해두었습니다.
  // 이들 템플릿을 content.cloneNode(true)로 복제하여 원하는 시점에 #contents 내부에 동적으로 배치합니다.
  const tStudyTitle       = document.getElementById("study-title");    // 상단 타이틀용 템플릿
  const tStudySelect      = document.getElementById("study-select");   // course + problem 선택 폼 템플릿
  const tConfirmButton    = document.getElementById("confirm-button"); // 확인 버튼 템플릿
  const tPage             = document.querySelector("template.page");   // A4 페이지용 템플릿

  // #study-select 템플릿 안에는 다시 <template class="course">, <template class="problem">가 포함됨
  // 필요한 시점에 .course 또는 .problem 부분만 골라서 복제할 수 있도록 참조
  const tCourse  = tStudySelect.content.querySelector("template.course");
  const tProblem = tStudySelect.content.querySelector("template.problem");

  // 실제로 HTML에 존재하는 컨테이너
  const contents  = document.getElementById("contents");
  const xCategory = document.getElementById("x-category");  // 상단 선택흔적 표시
  const ySlide    = document.getElementById("y-slide");     // 좌측 슬라이드메뉴

  // Firebase Firestore와 기타 데이터(예: studyCategory, courseData, principleImageID, problemID)는
  // study.html에서 script로 로드되어 전역으로 사용 가능하다고 가정합니다.
  // (firebase.initializeApp, db = firebase.firestore() 등)

  //-----------------------------------
  // 1. ySlide(좌측 메뉴) 동적 구성
  //-----------------------------------
  // 기존과 동일하게 studyCategory 데이터를 바탕으로 ul>li를 생성합니다(hover 시 li 펼쳐짐 유지).
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

  //-----------------------------------
  // 2. #contents를 매번 비우는 함수
  //-----------------------------------
  // 템플릿을 새로 로드하기 전에 #contents 내부의 기존 요소를 없애기 위해 사용
  function clearContents() {
    contents.innerHTML = "";
  }

  //-----------------------------------
  // 3. 템플릿 복제 함수들
  //-----------------------------------
  // (1) study-title 템플릿 로드
  function createStudyTitleElement() {
    // <div id="study-title">라는 래퍼 div를 만들고, 템플릿의 내용물을 복제해 넣습니다.
    const wrapper = document.createElement("div");
    wrapper.id = "study-title";
    // 템플릿은 <template id="study-title">...</template> 안의 내용을 cloneNode(true)
    // <template>의 .content를 복제하면 실제 자식 노드를 얻을 수 있습니다.
    const clone = tStudyTitle.content.cloneNode(true);
    wrapper.appendChild(clone);
    return wrapper;
  }

  // (2) study-select 템플릿 로드
  // course만 필요한 경우 / course+problem 모두 필요한 경우에 따라 div를 구성
  function createStudySelectElement(needsCourse, needsProblem) {
    // <div id="study-select"> 래퍼
    const wrapper = document.createElement("div");
    wrapper.id = "study-select";

    // 템플릿 #study-select 자체를 cloneNode하면 <template class="course">, <template class="problem">가 들어있습니다.
    // 하지만 그 중 필요한 부분만 꺼내서 div로 감싸고자 하므로, 부분적으로 접근
    const tempClone = tStudySelect.content.cloneNode(true); // 전체 clone

    // 2-1. course 파트
    if (needsCourse) {
      // tStudySelect 내부에 있는 <template class="course">
      // 이미 위에서 tCourse 상수로 참조했지만, 매번 cloneNode 해줘야 합니다.
      const courseDiv = document.createElement("div");
      courseDiv.classList.add("course");
      courseDiv.appendChild(tCourse.content.cloneNode(true));
      wrapper.appendChild(courseDiv);
    }

    // 2-2. problem 파트
    if (needsProblem) {
      const problemDiv = document.createElement("div");
      problemDiv.classList.add("problem");
      problemDiv.appendChild(tProblem.content.cloneNode(true));
      wrapper.appendChild(problemDiv);
    }

    return wrapper;
  }

  // (3) confirm-button 템플릿 로드
  function createConfirmButtonElement() {
    // <div id="confirm-button">
    const wrapper = document.createElement("div");
    wrapper.id = "confirm-button";
    const clone = tConfirmButton.content.cloneNode(true);
    wrapper.appendChild(clone);
    return wrapper;
  }

  // (4) page(A4) 템플릿 로드
  // 최종적으로 문제나 이미지를 표시할 때 사용하는 A4 스타일 영역
  function createPageElement() {
    // <div class="page" style="display:block"> ... <div class="page-contents">...</div>
    const wrapper = document.createElement("div");
    wrapper.classList.add("page");
    wrapper.style.display = "block";

    // 원본 <template class="page"> 안에는 <div class="page-contents">가 들어있음
    const clone = tPage.content.cloneNode(true);
    wrapper.appendChild(clone);

    return wrapper;
  }

  //-----------------------------------
  // 4. ySlide에서 li 클릭 시 동작
  //-----------------------------------
  // - x-category 내용 갱신 (상단 표시)
  // - #contents에 study-title, study-select, confirm-button 순서대로 로드
  // - (courseOnly or course+Problem) 여부에 따라 로드
  // - "선택하기"/"구성하기" 버튼 텍스트 변경
  // - 버튼 클릭 시 handleConfirm() 수행
  //-----------------------------------
  ySlide.addEventListener("click", function(event) {
    if (event.target.tagName.toLowerCase() === "li") {
      const selectedId      = event.target.id;           // 예: "c-basic"
      const selectedText    = event.target.textContent;  // 예: "기본학습"
      const selectedOuterCat= event.target.dataset.category; // 상위 카테고리

      // 상단 xCategory 갱신
      xCategory.innerHTML = `<div>${selectedOuterCat}</div><div class="interval-x"></div><div>${selectedText}</div>`;

      // 2-1, 2-2에 해당하는지 판별
      const setCourseOnly = [
        "c-principle", "e-testSupplement", "e-examSimulationSupplement", 
        "e-satSimulationSupplement", "p-learningAnalysis"
      ];
      const setCourseAndProblem = [
        "c-basic", "c-training", "c-intensive", 
        "e-test", "e-examSimulation", "e-satSimulation"
      ];

      let needsCourse  = false;
      let needsProblem = false;

      if (setCourseOnly.includes(selectedId)) {
        needsCourse  = true;  // problem은 필요 x
      } else if (setCourseAndProblem.includes(selectedId)) {
        needsCourse  = true;
        needsProblem = true;
      }
      // 그 외 카테고리는 둘 다 false가 될 수도 있음

      // #contents 싹 비우기
      clearContents();

      // study-title 로드 (div로 구성). 템플릿 기본문구는 "타이틀...."이지만, 여기서는 사용자가 클릭한 메뉴 텍스트를 보이도록 수정
      const studyTitleEl = createStudyTitleElement();
      // studyTitleEl의 텍스트를 선택된 메뉴 이름으로 대체
      studyTitleEl.textContent = selectedText;
      contents.appendChild(studyTitleEl);

      // study-select 로드 (필요한 경우만)
      let studySelectEl = null;
      if (needsCourse || needsProblem) {
        studySelectEl = createStudySelectElement(needsCourse, needsProblem);
        contents.appendChild(studySelectEl);
      }

      // confirm-button 로드
      const confirmButtonEl = createConfirmButtonElement();
      contents.appendChild(confirmButtonEl);

      // 버튼 텍스트 결정
      const btn = confirmButtonEl.querySelector("button");
      if (needsCourse && needsProblem) {
        btn.textContent = "구성하기";
      } else if (needsCourse) {
        btn.textContent = "선택하기";
      } else {
        btn.textContent = "선택하기 or 구성하기";
      }

      // -------------------------
      // (부가) 폼 내부 제어 로직
      // -------------------------
      // course 부분, problem 부분 각각에 대해 기존에 있던 이벤트 처리(라디오 선택 시 단원 드롭다운, 체크박스 표시 등)를 설정해야 합니다.
      // 템플릿으로부터 새로 복제되었기 때문에, 새로 만들어진 .course 내부 요소에 이벤트를 부여해야 합니다.

      // 4-1. course 부분 이벤트 연결
      if (needsCourse && studySelectEl) {
        setUpCourseEventListeners(studySelectEl);
      }
      // 4-2. problem 부분 이벤트 연결
      if (needsProblem && studySelectEl) {
        setUpProblemEventListeners(studySelectEl);
      }

      // -------------------------
      // 5. 버튼 클릭 시 (확정)
      // -------------------------
      // 2-1, 2-2 모두 결정된 상태거나, 혹은 course만 선택된 상태 등에서 "확인" or "구성하기"를 누르면
      // #contents 안을 비우고 .page 템플릿만 로드 -> 문제/이미지 등을 표시
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        handleConfirm(needsCourse, needsProblem, studySelectEl);
      });
    }
  });

  //-----------------------------------
  // 5. course 폼 이벤트 설정
  //-----------------------------------
  // - 라디오 '공통수학1' 등 선택 시, unit-select 옵션 구성
  // - unit 선택 시 category-checkbox 체크박스들 구성
  // - 선택내용으로 상단 제목 요약 updateStudyTitle()
  //-----------------------------------
  function setUpCourseEventListeners(containerEl) {
    // containerEl은 #study-select div
    const courseDiv          = containerEl.querySelector(".course");
    if (!courseDiv) return;

    const courseRadios       = courseDiv.querySelectorAll('input[name="course"]');
    const unitSelect         = courseDiv.querySelector("#unit-select");
    const categoryCheckboxDiv= courseDiv.querySelector("#category-checkbox");

    // courseData를 보고, courseRadios가 클릭될 때마다 대단원, 소단원 정보 갱신
    let selectedCourseData = [];

    // study-title 반영(단순 표시용)
    function updateStudyTitle() {
      // 현재 #study-title 영역(맨 위 div id="study-title")을 찾아 텍스트 구성
      const studyTitleEl = document.getElementById("study-title");
      if (!studyTitleEl) return;

      let courseText       = "";
      let unitText         = "";
      let categoryTexts    = [];

      // 현재 선택된 라디오
      const checkedRadio = courseDiv.querySelector('input[name="course"]:checked');
      if (checkedRadio) {
        // 바로 앞 label 텍스트 가져오기
        const labelEl = checkedRadio.previousElementSibling;
        if (labelEl && labelEl.tagName.toLowerCase() === "label") {
          courseText = labelEl.textContent.trim();
        }
      }

      // unitSelect
      if (unitSelect && unitSelect.value) {
        unitText = unitSelect.options[unitSelect.selectedIndex].textContent.trim();
      }

      // 소단원 체크박스
      const checkedCategory = categoryCheckboxDiv.querySelectorAll('input[type="checkbox"]:checked');
      checkedCategory.forEach(chk => {
        // label 안에 들어있다고 가정 -> label 텍스트 추가
        const parentLabel = chk.parentElement;
        if (parentLabel) {
          categoryTexts.push(parentLabel.textContent.trim());
        }
      });

      // 타이틀 문구 구성
      let titleText = "";
      if (courseText) titleText += courseText;
      if (unitText)   titleText += (titleText ? " → " : "") + unitText;
      if (categoryTexts.length > 0) {
        titleText += (titleText ? " → " : "") + categoryTexts.join(", ");
      }

      studyTitleEl.textContent = titleText || "타이틀....";
    }

    // 과정 라디오 change
    courseRadios.forEach(radio => {
      radio.addEventListener("change", function() {
        // 라디오 바뀌면 대단원/소단원 초기화
        unitSelect.innerHTML = '<option value="">대단원 선택</option>';
        unitSelect.disabled = true;
        categoryCheckboxDiv.innerHTML = '';
        updateStudyTitle();

        // radio.value == "h01" 등
        const courseKey = this.value;
        if (courseData[courseKey]) {
          selectedCourseData = courseData[courseKey];
          // 대단원 select 옵션 구성
          let uniqueUnits = {};
          selectedCourseData.forEach(item => {
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

    // 대단원 select change
    unitSelect.addEventListener("change", function() {
      categoryCheckboxDiv.innerHTML = '';
      updateStudyTitle();

      const selectedUnit = this.value;
      if (selectedUnit && selectedCourseData.length > 0) {
        const matchingItems = selectedCourseData.filter(item => {
          return Object.keys(item.unit)[0] === selectedUnit;
        });
        // 소단원(checkbox) 구성
        matchingItems.forEach(item => {
          const sortedKeys = Object.keys(item.category).sort();
          sortedKeys.forEach(key => {
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
    });

    // 소단원 checkbox change
    categoryCheckboxDiv.addEventListener("change", function() {
      updateStudyTitle();
    });
  }

  //-----------------------------------
  // 6. problem 폼 이벤트 설정
  //-----------------------------------
  // 여기서는 주로 문항유형(type: u, s, t), 난이도(difficulty: f,e,d,...)를 선택
  // 필요하다면 실시간으로 study-title에 반영할 수도 있으나, 보통은 최종적으로 confirm 시점에만 사용
  //-----------------------------------
  function setUpProblemEventListeners(containerEl) {
    // containerEl은 #study-select div
    const problemDiv = containerEl.querySelector(".problem");
    if (!problemDiv) return;

    // 여기서는 추가 이벤트가 필요하다면 작성
    // 예: range input(#questionCount) 값 변동 시 output 표시 등
    const rangeInput = problemDiv.querySelector("#questionCount");
    const rangeOutput= problemDiv.querySelector("#questionOutput");
    if (rangeInput && rangeOutput) {
      rangeInput.addEventListener("input", function() {
        rangeOutput.value = this.value;
      });
    }
  }

  //-----------------------------------
  // 7. 확인 버튼(handleConfirm) 처리
  //-----------------------------------
  // - courseOnly / course+Problem 여부에 따라 선택된 코드 정리
  // - DB or 이미지 로드
  // - #contents 초기화 후, page 템플릿만 삽입
  // - page-contents 내부에 문제 or 이미지를 동적으로 생성/삽입
  // - paginateContents()로 A4 분할
  //-----------------------------------
  function handleConfirm(needsCourse, needsProblem, studySelectEl) {
    // #contents 내부를 비우고(page/confirm 등 모두 제거)
    clearContents();

    // 새 페이지 템플릿 로드
    const pageElement = createPageElement();
    contents.appendChild(pageElement);

    // page-contents 찾아서 문제/이미지 삽입
    const pageContents = pageElement.querySelector(".page-contents");
    if (!pageContents) return;

    //--------------------------------
    // 7-1. 과정(course) 선택값 읽기
    //--------------------------------
    let courseCodes = [];
    if (needsCourse && studySelectEl) {
      const courseDiv = studySelectEl.querySelector(".course");
      if (courseDiv) {
        const unitSelect         = courseDiv.querySelector("#unit-select");
        const categoryCheckboxDiv= courseDiv.querySelector("#category-checkbox");

        const unitKey = unitSelect ? unitSelect.value : "";
        const checkedCategories = categoryCheckboxDiv ? categoryCheckboxDiv.querySelectorAll('input[type="checkbox"]:checked') : [];

        checkedCategories.forEach(chk => {
          // unitKey + chk.value 예: "h0112"
          courseCodes.push(unitKey + chk.value);
        });
      }
    }

    //--------------------------------
    // 7-2. problem(문항) 선택값 읽기
    //--------------------------------
    let problemCodes = [];
    let questionCount = 10; // 기본
    if (needsProblem && studySelectEl) {
      const problemDiv = studySelectEl.querySelector(".problem");
      if (problemDiv) {
        const selectedType = problemDiv.querySelector('input[name="type"]:checked');
        if (selectedType) {
          const typeVal = selectedType.value; // 예: "u", "s", "t"
          const diffChecks = problemDiv.querySelectorAll('input[name="difficulty"]:checked');
          diffChecks.forEach(chk => {
            // 예: "u"+"f" = "uf"
            problemCodes.push(typeVal + chk.value);
          });
        }
        const qCountInput = problemDiv.querySelector("#questionCount");
        if (qCountInput) {
          questionCount = parseInt(qCountInput.value, 10);
        }
      }
    }

    console.log("과정코드:", courseCodes, "문제코드:", problemCodes, "문항수:", questionCount);

    // ----------------------------------------
    // 7-3. (case A) courseCodes만 있을 경우
    //      => 원리학습 이미지(principleImageID) 로드
    // ----------------------------------------
    if (courseCodes.length > 0 && problemCodes.length === 0) {
      const allImageElements = [];
      const imageLoadPromises = [];

      courseCodes.forEach(code => {
        // code 예: "h0112"
        const unitKey = code.substring(0,2);    // "h0"
        // categoryKey = code.substring(2,4);  // "11" 등 (필요하다면 사용)
        const fileList = principleImageID[unitKey] || [];
        // startsWith(code)로 해당 분류 파일 찾기
        const matchingFiles = fileList.filter(file => file.startsWith(code));

        matchingFiles.forEach(file => {
          const wrapperDiv = document.createElement("div");
          const img = document.createElement("img");
          // 예시 경로
          img.src = "https://storage.googleapis.com/mathproblemdb-9f42d.firebasestorage.app/mathproblem_high_principleData/" + file;

          // 이미지 로드 완료 후 처리
          const imgLoadPromise = new Promise(resolve => {
            img.onload = resolve;
            img.onerror= resolve;
          });

          imageLoadPromises.push(imgLoadPromise);
          wrapperDiv.appendChild(img);
          allImageElements.push(wrapperDiv);
        });
      });

      Promise.all(imageLoadPromises).then(() => {
        // 모든 이미지 로드 끝난 뒤 pageContents에 한 번에 추가
        allImageElements.forEach(el => pageContents.appendChild(el));
        // A4 분할
        paginateContents();
      });
    }

    // ----------------------------------------
    // 7-4. (case B) courseCodes + problemCodes
    //      => 문제ID 로드, Firestore에서 문항 html_Q, html_A 가져옴
    // ----------------------------------------
    if (courseCodes.length > 0 && problemCodes.length > 0) {
      const combinedCodes = [];
      courseCodes.forEach(cCode => {
        problemCodes.forEach(pCode => {
          combinedCodes.push(cCode + pCode); 
          // 예: "h01"+"12"+"uf" => "h0112uf"
        });
      });

      // problemID에서 prefix가 일치하는 항목 찾기
      const matchingProblemCodes = [];
      combinedCodes.forEach(prefix => {
        const unitKey = prefix.substring(0,2);
        const allProblems = problemID[unitKey] || [];
        const matches = allProblems.filter(code => code.startsWith(prefix));
        matchingProblemCodes.push(...matches);
      });

      // 무작위로 questionCount개 뽑기
      const selectedCodes = [];
      const usedIndices = new Set();
      while (selectedCodes.length < questionCount && usedIndices.size < matchingProblemCodes.length) {
        const randIdx = Math.floor(Math.random() * matchingProblemCodes.length);
        if (!usedIndices.has(randIdx)) {
          usedIndices.add(randIdx);
          selectedCodes.push(matchingProblemCodes[randIdx]);
        }
      }

      // Firestore에서 해당 문제 문서(html_Q, html_A) 가져오기
      const fetchPromises = selectedCodes.map(fullCode => {
        const unitKey     = fullCode.substring(0,2);
        const categoryKey = fullCode.substring(2,4); // 예: "11"
        // courseData를 순회하여 unit이름, category이름을 찾아 문서ID로 활용
        let unitName = "", categoryName = "";
        outer: for (const cKey in courseData) {
          for (const item of courseData[cKey]) {
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

        const unitDocId     = `${unitKey}_${unitName}`;
        const categoryDocId = `${categoryKey}_${categoryName}`;
        const problemDocId  = fullCode;

        // Firestore 컬렉션 구조 예시: high_units/{unitDocId}/contents/{categoryDocId}/problems/{problemDocId}
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
              return {
                code: problemDocId,
                html_Q: data.html_Q,
                html_A: data.html_A
              };
            }
            return null;
          });
      });

      Promise.all(fetchPromises).then(results => {
        results.forEach(item => {
          if (item) {
            const wrapper = document.createElement("div");
            wrapper.id = item.code;
            wrapper.textContent = "문제 " + item.code; // 문제코드 제목정도

            // 문제 내용
            const divQ = document.createElement("div");
            divQ.className = "html_Q";
            divQ.innerHTML = item.html_Q || "";
            wrapper.appendChild(divQ);

            // 구분자
            let span = document.createElement("span");
            span.className = "interval-y";
            wrapper.appendChild(span);

            // 정답 내용
            const divA = document.createElement("div");
            divA.className = "html_A";
            divA.innerHTML = "정답 " + (item.html_A || "");
            wrapper.appendChild(divA);

            // 구분자
            span = document.createElement("span");
            span.className = "interval-y";
            wrapper.appendChild(span);

            pageContents.appendChild(wrapper);
          }
        });

        // mathjax 렌더링
        MathJax.typeset();
        // A4 분할
        paginateContents();
      })
      .catch(error => {
        console.error("문제 데이터 로딩 실패:", error);
      });
    }
  }

  //-----------------------------------
  // 8. A4 페이지 분할 함수
  //-----------------------------------
  // 기존 study.js 코드와 동일하게 pageHeight 기준으로 초과 시 새 .page를 만들어 나누어 붙이는 로직
  //-----------------------------------
  function paginateContents() {
    const allPages = Array.from(contents.querySelectorAll(".page"));
    if (allPages.length === 0) return;

    // 첫 번째 페이지 높이를 기준으로 잡음
    const pageHeight = allPages[0].offsetHeight;

    // 기존 page-contents에 들어있는 모든 자식요소를 한 군데로 모음
    const allItems = [];
    allPages.forEach(page => {
      const pc = page.querySelector(".page-contents");
      if (pc) {
        allItems.push(...Array.from(pc.children));
      }
    });

    // 기존 페이지 전부 제거
    allPages.forEach(page => page.remove());

    // 새 페이지 하나 생성
    let currentPage = createPageElement(); 
    contents.appendChild(currentPage);
    let currentContents = currentPage.querySelector(".page-contents");

    // 요소들을 순회하며 높이 초과 시 새 페이지로 넘김
    allItems.forEach(item => {
      currentContents.appendChild(item);
      if (currentPage.scrollHeight > pageHeight) {
        currentContents.removeChild(item);

        currentPage = createPageElement();
        contents.appendChild(currentPage);
        currentContents = currentPage.querySelector(".page-contents");
        currentContents.appendChild(item);
      }
    });
  }

});
