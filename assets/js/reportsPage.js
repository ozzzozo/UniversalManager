reports = JSON.parse(reports);
const table = document.getElementById("insertTable");
const entries = document.getElementById("entries");

function goto(whereTo) {
    if(window.location.href.endsWith("/")) {
        window.location.href += whereTo;
    } else {
        window.location.href += "/" + whereTo;
    }
}

entries.innerText = `Showing 1 to ${reports.length % 10} of ${reports.length} Entries`;

const textColors = {"finished": "text-green-900", "active": "text-indigo-900", "suspended": "text-red-900"};
const bColors = {"finished": "bg-green-200", "active": "bg-indigo-200", "suspended": "bg-red-200"};

reports.forEach(report => {
    let rtempalte = `
    <tr onclick="goto('${report["ID"]}')">
        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <div class="flex items-center">
                    <div class="ml-3">
                        <p class="text-gray-900 whitespace-no-wrap">
                            ${report["name"]}
                        </p>
                    </div>
            </div>
        </td>
        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p class="text-gray-900 whitespace-no-wrap">${report["client"]}</p>
        </td>
        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p class="text-gray-900 whitespace-no-wrap">
            ${report["createdAt"]}
            </p>
        </td>
        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p class="text-gray-900 whitespace-no-wrap">
            ${report["findings"]}
            </p>
        </td>
        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <span
                class="relative inline-block px-3 py-1 font-semibold ${textColors[report["status"]]} leading-tight">
                <span aria-hidden
                    class="absolute inset-0 ${bColors[report["status"]]} opacity-50 rounded-full"></span>
            <span class="relative">${report["status"]}</span>
            </span>
        </td>
    </tr>
    `

    table.innerHTML += rtempalte;
});