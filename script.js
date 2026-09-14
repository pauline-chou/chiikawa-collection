const collectionData = [

    {
        id: 1,
        name: "人魚島的小八",
        character: "小八",
        project: "人魚島的秘密",
        features: [],
        region: "日本",
        location: "",
        limitedType: "",
        owner: "我",
        status: "owned",
        image: "images/hachiware.jpg",
        note: ""
    },

    {
        id: 2,
        name: "台灣垂耳兔",
        character: "兔兔",
        project: "",
        features: ["垂耳"],
        region: "台灣",
        location: "",
        limitedType: "地區限定",
        owner: "朋友",
        status: "owned",
        image: "",
        note: ""
    },

    {
        id: 3,
        name: "澳門蛋塔",
        character: "兔兔",
        project: "",
        features: ["蛋塔"],
        region: "澳門",
        location: "",
        limitedType: "地區限定",
        owner: "朋友",
        status: "owned",
        image: "",
        note: ""
    },

    {
        id: 4,
        name: "富士山吉伊",
        character: "吉伊",
        project: "",
        features: ["富士山"],
        region: "日本",
        location: "富士山",
        limitedType: "地區限定",
        owner: "我",
        status: "owned",
        image: "",
        note: ""
    },

    {
        id: 5,
        name: "長野蘋果小八",
        character: "小八",
        project: "",
        features: ["蘋果"],
        region: "日本",
        location: "長野",
        limitedType: "地區限定",
        owner: "我",
        status: "owned",
        image: "",
        note: ""
    },

    {
        id: 6,
        name: "沖繩吉伊",
        character: "吉伊",
        project: "",
        features: [],
        region: "日本",
        location: "沖繩",
        limitedType: "地區限定",
        owner: "朋友",
        status: "owned",
        image: "",
        note: ""
    },

    {
        id: 7,
        name: "魔法少女小八",
        character: "小八",
        project: "魔法少女",
        features: ["魔法少女"],
        region: "日本",
        location: "",
        limitedType: "",
        owner: "我",
        status: "owned",
        image: "",
        note: ""
    },

    {
        id: 8,
        name: "微醺吉伊",
        character: "吉伊",
        project: "",
        features: ["微醺"],
        region: "日本",
        location: "",
        limitedType: "",
        owner: "朋友",
        status: "owned",
        image: "",
        note: ""
    }

];


const collectionList = document.querySelector("#collection-list");
const collectionCount = document.querySelector("#collection-count");
const searchInput = document.querySelector("#search-input");

const characterButtons =
    document.querySelectorAll("[data-character]");

const ownerButtons =
    document.querySelectorAll("[data-owner]");

let selectedCharacter = "all";
let selectedOwner = "all";

function renderCollection(data) {

    collectionList.innerHTML = "";

    data.forEach(function (item) {

        const card = document.createElement("div");

        card.classList.add("item");

        card.innerHTML = `
            <div class="item-image">
                ${item.image
                    ? `<img src="${item.image}" alt="${item.name}">`
                    : "🧸"}
            </div>

            <h3>${item.name}</h3>

            <div class="tags">
                <span>${item.character}</span>

                ${item.project
                    ? `<span>${item.project}</span>`
                    : ""}

                ${item.features.length > 0
                    ? `<span>${item.features.join("、")}</span>`
                    : ""}

                ${item.limitedType
                    ? `<span>${item.limitedType}</span>`
                    : ""}

                ${item.location
                    ? `<span>${item.location}</span>`
                    : ""}
            </div>

            <p>👤 ${item.owner}</p>

            <label>
                <input type="checkbox">
                已收藏
            </label>
        `;

        collectionList.appendChild(card);

    });

}


// 第一次載入網頁時，顯示全部收藏
renderCollection(collectionData);
updateCollectionCount();

// 搜尋
searchInput.addEventListener("input", function () {

    filterCollection();

});

// 篩選
function filterCollection() {

    const keyword = searchInput.value.toLowerCase();

    const filteredData = collectionData.filter(function (item) {

        const matchKeyword =
            item.name.toLowerCase().includes(keyword);

        const matchCharacter =
            selectedCharacter === "all" ||
            item.character === selectedCharacter;

        const matchOwner =
            selectedOwner === "all" ||
            item.owner === selectedOwner;

        return (
            matchKeyword &&
            matchCharacter &&
            matchOwner
        );

    });

    renderCollection(filteredData);
}
characterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        selectedCharacter = button.dataset.character;

        characterButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        filterCollection();

    });

});
ownerButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        selectedOwner = button.dataset.owner;

        ownerButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        filterCollection();

    });

});

//計算數量
function updateCollectionCount() {

    const ownedCount = collectionData.filter(function (item) {

        return item.status === "owned";

    }).length;

    collectionCount.textContent =
        `目前共收藏 ${ownedCount} 件`;
}