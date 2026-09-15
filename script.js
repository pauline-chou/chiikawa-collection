// ==============================
// Supabase 設定
// ==============================

const SUPABASE_URL =
    "https://yqdjpvubgzavjxyzzyew.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_-m1uq3TOG36HG-KCmXAI3Q_5HijxVSH";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==============================
// 取得 HTML 元素
// ==============================

const collectionList =
    document.querySelector("#collection-list");

const collectionCount =
    document.querySelector("#collection-count");

const searchInput =
    document.querySelector("#search-input");

const characterButtons =
    document.querySelectorAll("[data-character]");

const ownerButtons =
    document.querySelectorAll("[data-owner]");


// ==============================
// 篩選狀態
// ==============================

let selectedCharacter = "all";
let selectedOwner = "all";


// ==============================
// 收藏資料
// ==============================

let collectionData = [];


// ==============================
// 從 Supabase 取得收藏資料
// ==============================

async function loadCollection() {

    console.log("正在從 Supabase 取得資料...");

    const { data, error } = await supabaseClient
        .from("items")
        .select(`
            id,
            name,
            image_url,
            character_id,
            region_id,
            series_id,
            characters (
                name
            ),
            regions (
                name
            ),
            series (
                name
            ),
            ownerships (
                member_id,
                members (
                    name
                )
            ),
            item_limited_types (
                limited_types (
                    name
                )
            )
        `);

    if (error) {

        console.error("Supabase 讀取失敗：", error);

        collectionList.innerHTML =
            "<p>資料讀取失敗，請打開 Console 查看錯誤。</p>";

        return;
    }

    console.log("Supabase 資料：", data);


    // ==============================
    // 將 Supabase 資料轉成網頁原本使用的格式
    // ==============================

    collectionData = data.map(function (item) {

        const owners =
            item.ownerships
                ? item.ownerships.map(function (ownership) {
                    return ownership.members.name;
                })
                : [];


        const limitedTypes =
            item.item_limited_types
                ? item.item_limited_types.map(function (type) {
                    return type.limited_types.name;
                })
                : [];


        return {

            id: item.id,

            name: item.name,

            character:
                item.characters
                    ? item.characters.name
                    : "",

            region:
                item.regions
                    ? item.regions.name
                    : "",

            project:
                item.series
                    ? item.series.name
                    : "",

            limitedType:
                limitedTypes.join("、"),

            owner:
                owners.join("、"),

            owners: owners,

            status:
                owners.length > 0
                    ? "owned"
                    : "",

            image:
                item.image_url || "",

            features: [],

            location: "",

            note: ""

        };

    });


    console.log("轉換後的收藏資料：", collectionData);


    // ==============================
    // 顯示收藏
    // ==============================

    renderCollection(collectionData);

    updateCollectionCount();

}


// ==============================
// 顯示收藏卡片
// ==============================

function renderCollection(data) {

    collectionList.innerHTML = "";


    data.forEach(function (item) {

        const card =
            document.createElement("div");

        card.classList.add("item");


        card.innerHTML = `

            <div class="item-image">

                ${
                    item.image
                        ? `<img src="${item.image}" alt="${item.name}">`
                        : "🧸"
                }

            </div>


            <h3>${item.name}</h3>


            <div class="tags">

                ${
                    item.character
                        ? `<span>${item.character}</span>`
                        : ""
                }


                ${
                    item.project
                        ? `<span>${item.project}</span>`
                        : ""
                }


                ${
                    item.limitedType
                        ? `<span>${item.limitedType}</span>`
                        : ""
                }


                ${
                    item.region
                        ? `<span>${item.region}</span>`
                        : ""
                }

            </div>


            <p>
                👤 ${
                    item.owner
                        ? item.owner
                        : "尚未收藏"
                }
            </p>


            <label>

                <input
                    type="checkbox"
                    ${item.status === "owned" ? "checked" : ""}
                    disabled
                >

                已收藏

            </label>

        `;


        collectionList.appendChild(card);

    });

}


// ==============================
// 搜尋
// ==============================

searchInput.addEventListener(
    "input",
    function () {

        filterCollection();

    }
);


// ==============================
// 篩選
// ==============================

function filterCollection() {

    const keyword =
        searchInput.value
            .toLowerCase();


    const filteredData =
        collectionData.filter(function (item) {


            const matchKeyword =

                item.name
                    .toLowerCase()
                    .includes(keyword);


            const matchCharacter =

                selectedCharacter === "all" ||
                item.character === selectedCharacter;


            const matchOwner =

                selectedOwner === "all" ||
                item.owners.includes(selectedOwner);


            return (

                matchKeyword &&
                matchCharacter &&
                matchOwner

            );

        });


    renderCollection(filteredData);

}


// ==============================
// 角色篩選按鈕
// ==============================

characterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                selectedCharacter =
                    button.dataset.character;


                characterButtons.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                filterCollection();

            }
        );

    }
);


// ==============================
// 收藏者篩選按鈕
// ==============================

ownerButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                selectedOwner =
                    button.dataset.owner;


                ownerButtons.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                filterCollection();

            }
        );

    }
);


// ==============================
// 計算收藏數量
// ==============================

function updateCollectionCount() {

    const ownedCount =
        collectionData.filter(function (item) {

            return item.status === "owned";

        }).length;


    collectionCount.textContent =
        `目前共收藏 ${ownedCount} 件`;

}


// ==============================
// 啟動
// ==============================

loadCollection();

