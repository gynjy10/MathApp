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

    console.log("courseCodes:", courseCodes, "problemCodes:", problemCodes);

    const questionCount = parseInt(document.getElementById("questionCount").value, 10);
    const pageContents = document.querySelector(".page-contents");
    pageContents.innerHTML = "";

    // ⑤-1. courseCodes만 있을 경우: 모든 이미지(00~99) 출력
    if (courseCodes.length > 0 && problemCodes.length === 0) {
      courseCodes.forEach(function(code) {
        for (let i = 0; i < 10; i++) {
          let twoDigit = i.toString().padStart(2, "0");
          let img = document.createElement("img");
          img.src = "https://storage.googleapis.com/mathproblemdb-9f42d.firebasestorage.app/mathproblem_high_principleData/" + code + "pa" + twoDigit + ".png";
          pageContents.appendChild(img);
        }
      });
    }

    // ⑤-2. courseCodes와 problemCodes 모두 있을 경우: dummy 데이터 사용
    if (courseCodes.length > 0 && problemCodes.length > 0) {
      let combinedCodes = [];
      courseCodes.forEach(function(cCode) {
        problemCodes.forEach(function(pCode) {
          combinedCodes.push(cCode + pCode);
        });
      });

      function fetchFirestoreDataDummy(prefixes, count) {
        return new Promise((resolve, reject) => {
          let dummyData = [];
          prefixes.forEach(function(prefix) {
            for (let j = 0; j < 100; j++) {
              let codeSuffix = j.toString().padStart(2, "0");
              dummyData.push({
                code: prefix + codeSuffix,
                htmlQ: `<div>문제(${prefix}${codeSuffix}) - 질문 내용</div>`,
                htmlA: `<div>문제(${prefix}${codeSuffix}) - 답안 내용</div>`
              });
            }
          });
          let selectedItems = [];
          for (let i = 0; i < count; i++) {
            if (dummyData.length === 0) break;
            let randIndex = Math.floor(Math.random() * dummyData.length);
            selectedItems.push(dummyData[randIndex]);
            dummyData.splice(randIndex, 1);
          }
          resolve(selectedItems);
        });
      }

      fetchFirestoreDataDummy(combinedCodes, questionCount).then(selectedItems => {
        selectedItems.forEach(function(item) {
          let divQ = document.createElement("div");
          divQ.innerHTML = item.htmlQ;
          pageContents.appendChild(divQ);
          let divA = document.createElement("div");
          divA.innerHTML = item.htmlA;
          pageContents.appendChild(divA);
        });
      }).catch(err => {
        console.error("Firestore 데이터 가져오기 실패:", err);
      });
    }

    // 결과 출력 후 상단 제목, 선택영역, 확인 버튼 숨김
    document.getElementById("study-title").style.display = "none";
    const studySelect = document.querySelector(".study-select");
    if (studySelect) studySelect.style.display = "none";
    document.getElementById("confirm-button").style.display = "none";

    if (pageDiv) pageDiv.style.display = "block";
  });
});
