function showPage(pageId){
let pages=document.querySelectorAll(".page")

pages.forEach(p=>{
p.classList.remove("active")
})

document.getElementById(pageId).classList.add("active")
}

function logout(){
localStorage.removeItem("token")
window.location.href="login.html"
}

// ====== CHUYỂN TRANG ======
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");

    if (pageId === "semester") loadSemesterPage();
}

// ====== BIẾN ======
let scores = JSON.parse(localStorage.getItem("scores")) || [];
let editIndex = -1;

// ====== TÍNH ĐIỂM ======
function calculateTotal(qt, ck) {
    return (qt * 0.5 + ck * 0.5).toFixed(1);
}

// quy đổi thang 4
function convertTo4(score) {
    if (score >= 8.5) return 4;
    if (score >= 8) return 3.5;
    if (score >= 7) return 3;
    if (score >= 6.5) return 2.5;
    if (score >= 5.5) return 2;
    if (score >= 4) return 1;
    return 0;
}

// điểm chữ
function getLetter(score) {
    if (score >= 8.5) return "A";
    if (score >= 8) return "B+";
    if (score >= 7) return "B";
    if (score >= 6.5) return "C+";
    if (score >= 5.5) return "C";
    if (score >= 4) return "D";
    return "F";
}

// ====== FORM SUBMIT ======
document.getElementById("form").addEventListener("submit", function(e) {
    e.preventDefault();

    let subject = document.getElementById("subject").value;
    let credit = Number(document.getElementById("credit").value);
    let process = Number(document.getElementById("process").value);
    let final = Number(document.getElementById("final").value);
    let semester = document.getElementById("semesterSelect").value;

    let total = Number(calculateTotal(process, final));
    let scale4 = convertTo4(total);
    let letter = getLetter(total);
    let status = total >= 4 ? "Đậu" : "Rớt";

    let newScore = {
        subject, credit, process, final,
        total, scale4, letter, status, semester
    };

    if (editIndex === -1) scores.push(newScore);
    else {
        scores[editIndex] = newScore;
        editIndex = -1;
    }

    renderTable();
    updateSummary();
    this.reset();
});

// ====== HIỂN THỊ BẢNG ======
function renderTable() {
    let table = document.getElementById("tableBody");
    table.innerHTML = "";

    scores.forEach((s, index) => {
        table.innerHTML += `
        <tr>
            <td>${s.subject}</td>
            <td>${s.credit}</td>
            <td>${s.process}</td>
            <td>${s.final}</td>
            <td>${s.total}</td>
            <td>${s.scale4}</td>
            <td>${s.letter}</td>
            <td>${s.status}</td>
        </tr>`;
    });
}

// ====== TỔNG KẾT ======
function updateSummary() {
    let totalCredit = 0, sum10 = 0, sum4 = 0;

    scores.forEach(s => {
        totalCredit += s.credit;
        sum10 += s.total * s.credit;
        sum4 += s.scale4 * s.credit;
    });

    let avg10 = totalCredit ? (sum10 / totalCredit).toFixed(2) : 0;
    let avg4 = totalCredit ? (sum4 / totalCredit).toFixed(2) : 0;

    document.getElementById("avg10").innerText = avg10;
    document.getElementById("avg4").innerText = avg4;
    document.getElementById("sum10").innerText = sum10.toFixed(2);
    document.getElementById("sum4").innerText = sum4.toFixed(2);
}

// ====== LƯU VÀO LOCAL ======
function saveScores() {
    localStorage.setItem("scores", JSON.stringify(scores));
    alert("Đã lưu điểm!");
}

// ====== XÓA ======
function clearScores() {
    if (!confirm("Xóa toàn bộ điểm?")) return;
    scores = [];
    localStorage.removeItem("scores");
    renderTable();
    updateSummary();
}

// ====== RESET FORM ======
function resetForm() {
    document.getElementById("form").reset();
}

// ====== TRANG ĐIỂM THEO HỌC KỲ ======
function loadSemesterPage() {
    let container = document.getElementById("semester");

    let grouped = {};

    scores.forEach(s => {
        if (!grouped[s.semester]) grouped[s.semester] = [];
        grouped[s.semester].push(s);
    });

    let html = `<h1>Điểm theo học kỳ</h1>`;

    if (Object.keys(grouped).length === 0) {
        container.innerHTML = html + "<p>Chưa có dữ liệu.</p>";
        return;
    }

    for (let sem in grouped) {

        let totalCredit = 0, sum10 = 0, sum4 = 0;

        grouped[sem].forEach(s => {
            totalCredit += s.credit;
            sum10 += s.total * s.credit;
            sum4 += s.scale4 * s.credit;
        });

        let gpa10 = totalCredit ? (sum10 / totalCredit).toFixed(2) : 0;
        let gpa4 = totalCredit ? (sum4 / totalCredit).toFixed(2) : 0;

        html += `
        <div class="semester-box">

        <div class="semester-header">
            <h2>${sem}</h2>
            <button onclick="deleteSemester('${sem}')" class="btn-delete">
                Xóa học kỳ
            </button>
        </div>

        <table>
        <thead>
        <tr>
            <th>Môn</th>
            <th>Tín chỉ</th>
            <th>QT</th>
            <th>CK</th>
            <th>Tổng kết</th>
            <th>Thang 4</th>
            <th>Điểm chữ</th>
            <th>Tình trạng</th>
        </tr>
        </thead>

        <tbody>
        ${grouped[sem].map(s => `
            <tr>
                <td>${s.subject}</td>
                <td>${s.credit}</td>
                <td>${s.process}</td>
                <td>${s.final}</td>
                <td>${s.total}</td>
                <td>${s.scale4}</td>
                <td>${s.letter}</td>
                <td>${s.status}</td>
            </tr>
        `).join("")}
        </tbody>
        </table>

        <div class="semester-summary">
            <p>GPA thang 10: <b>${gpa10}</b></p>
            <p>GPA thang 4: <b>${gpa4}</b></p>
        </div>

        </div>
        `;
    }

    // ====== XÓA THEO HỌC KỲ ======
    function deleteSemester(semesterName) {

        if (!confirm("Bạn có chắc muốn xóa toàn bộ điểm của " + semesterName + "?"))
            return;

        // lọc bỏ học kỳ đó
        scores = scores.filter(s => s.semester !== semesterName);

        localStorage.setItem("scores", JSON.stringify(scores));

        renderTable();
        updateSummary();
        loadSemesterPage();
    }

    container.innerHTML = html;
}