// 데이터 정의
const courseData = {
    h1: [
        { unit: "SP", name: "집합과 명제" },
        { unit: "NS", name: "수체계" },
        { unit: "FC", name: "식의 연산" },
        { unit: "EI", name: "방정식과 부등식" },
        { unit: "AG", name: "도형의 방정식" },
        { unit: "FN", name: "함수" },
        { unit: "TG", name: "삼각함수" }
    ],
    h2: [
        { unit: "MT", name: "행렬" },
        { unit: "EL", name: "지수와 로그" },
        { unit: "EF", name: "지수함수와 로그함수" },
        { unit: "SQ", name: "수열" },
        { unit: "SL", name: "수열의 극한" }
    ],
    hs0: [
        { unit: "EI", name: "방정식과 부등식" },
        { unit: "TG", name: "삼각함수" },
        { unit: "LC", name: "함수의 극한과 연속성" },
        { unit: "DF", name: "미분" },
        { unit: "IG", name: "적분" }
    ],
    hs1: [
        { unit: "PC", name: "순열과 조합" },
        { unit: "PB", name: "확률" },
        { unit: "ST", name: "통계" }
    ],
    hs2: [
        { unit: "LT", name: "일차변환과 행렬" },
        { unit: "QC", name: "이차곡선" },
        { unit: "SC", name: "공간도형과 공간좌표" },
        { unit: "VC", name: "벡터" }
    ]
};

// JSON 데이터를 불러오는 함수
async function fetchKorMatheduData() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/gynjy10/open_work_space/refs/heads/main/MathApp/kor_mathedu_units_high.json');
        if (!response.ok) {
            throw new Error('Failed to load JSON data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching JSON data:', error);
        return [];
    }
}

// DOM 요소 참조
const mainMenu = document.getElementById("mainMenu");
const submenu1 = document.getElementById("submenu1");
const submenu2 = document.getElementById("submenu2");

// 과정 선택 이벤트
mainMenu.addEventListener("change", function () {
    const selectedValue = mainMenu.value;
    const selectedText = mainMenu.options[mainMenu.selectedIndex].text;

    if (selectedValue) {
        submenu1.disabled = false;
        submenu1.innerHTML = `<option value="" selected>${selectedText}의 대단원 선택</option>`;

        courseData[selectedValue].forEach((item) => {
            const option = document.createElement("option");
            option.value = item.unit; // unit 값을 저장
            option.textContent = item.name; // 대단원 이름 표시
            submenu1.appendChild(option);
        });

        submenu2.disabled = true;
        submenu2.innerHTML = `<option value="" selected>소단원 선택</option>`;
    } else {
        submenu1.disabled = true;
        submenu2.disabled = true;
        submenu1.innerHTML = `<option value="" selected>대단원 선택</option>`;
        submenu2.innerHTML = `<option value="" selected>소단원 선택</option>`;
    }
});

// 대단원 선택 이벤트
submenu1.addEventListener("change", async function () {
    const selectedUnit = submenu1.value; // 선택된 대단원의 unit 값
    const selectedName = submenu1.options[submenu1.selectedIndex].text; // 선택된 대단원의 unit 이름
    submenu2.disabled = true;
    submenu2.innerHTML = `<option value="" selected>${selectedName}의 소단원 선택</option>`;

    if (selectedUnit) {
        try {
            const korMatheduData = await fetchKorMatheduData();

            // kor_mathedu_units_high.json에서 선택된 unit 값을 기준으로 검색
            const unitData = korMatheduData.find(
                (item) => item.unit.includes(selectedUnit) // unit 배열에 선택된 값이 포함되어 있는지 확인
            );

            console.log('Selected Unit:', selectedUnit); // 디버깅: 선택된 대단원의 unit
            console.log('Unit Data:', unitData); // 디버깅: JSON에서 검색된 데이터

            if (unitData && unitData.contents) {
                submenu2.disabled = false;
                unitData.contents.forEach((content) => {
                    const option = document.createElement("option");
                    option.value = content.category[0]; // category의 첫 번째 값 저장
                    option.textContent = content.category[1]; // 소단원 이름 표시
                    submenu2.appendChild(option);
                });

                console.log('Submenu2 Contents Added:', unitData.contents); // 디버깅: 추가된 소단원 데이터
            } else {
                console.warn('No matching unit data found in JSON for:', selectedUnit);
            }
        } catch (error) {
            console.error('Error handling submenu1 change:', error);
        }
    }

    const selectedCategory = submenu2.value; // 선택된 소단원의 category 값
    const selectedTitle = submenu2.options[submenu2.selectedIndex].text; // 선택된 소단원의 category 이름

    const selectedCode = selectedUnit + selectedCategory; // 선택된 소단원의 code 값
    console.log('selectedCode:', selectedCode); // 선택으로 조합된 코드넘버

});

