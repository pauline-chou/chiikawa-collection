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

console.log("Supabase Key 是否存在：", !!SUPABASE_KEY);


// ==============================
// HTML 元素
// ==============================

const collectionList =
    document.querySelector("#collection-list");

const searchInput =
    document.querySelector("#search-input");

const characterButtons =
    document.querySelectorAll("[data-character]");

const ownerButtons =
    document.querySelectorAll("[data-owner]");

const ownedCount =
    document.querySelector("#owned-count");

const totalCount =
    document.querySelector("#total-count");

const progressPercent =
    document.querySelector("#progress-percent");

const progressBar =
    document.querySelector("#progress-bar");

const resultCount =
    document.querySelector("#result-count");


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
// 收藏者資料
// ==============================

let membersData = [];


// ==============================
// 建立收藏者篩選按鈕
// ==============================

function renderOwnerFilters() {

    const filterContainer =
        document.querySelector(
            '[data-owner="all"]'
        )?.parentElement;


    if (!filterContainer) {
        return;
    }


    filterContainer.innerHTML = "";


    // --------------------------
    // 全部
    // --------------------------

    const allButton =
        document.createElement("button");

    allButton.className =
        "filter-button active";

    allButton.dataset.owner =
        "all";

    allButton.textContent =
        "All";


    filterContainer.appendChild(
        allButton
    );


    // --------------------------
    // 每個收藏者
    // --------------------------

    membersData.forEach(
        function (member, index) {

            const button =
                document.createElement("button");

            button.className =
                "filter-button";

            button.dataset.owner =
                String(member.id);


            // 第一個人使用藍色
            // 第二個人使用粉色
            // 其他人使用一般樣式

            let dotClass = "";

            if (index === 0) {
                dotClass = "pauline";
            }
            else if (index === 1) {
                dotClass = "alice";
            }


            button.innerHTML = `

                ${
                    dotClass
                        ? `<span class="owner-dot ${dotClass}"></span>`
                        : ""
                }

                ${escapeHTML(member.name)}

            `;


            filterContainer.appendChild(
                button
            );


            button.addEventListener(
                "click",
                function () {

                    selectedOwner =
                        String(member.id);


                    updateOwnerFilterActive(
                        button
                    );


                    filterCollection();

                }
            );

        }
    );


    // --------------------------
    // Both
    // --------------------------

    const bothButton =
        document.createElement("button");

    bothButton.className =
        "filter-button";

    bothButton.dataset.owner =
        "both";

    bothButton.textContent =
        "Both";


    filterContainer.appendChild(
        bothButton
    );


    bothButton.addEventListener(
        "click",
        function () {

            selectedOwner = "both";

            updateOwnerFilterActive(
                bothButton
            );

            filterCollection();

        }
    );


    // --------------------------
    // All button
    // --------------------------

    allButton.addEventListener(
        "click",
        function () {

            selectedOwner = "all";

            updateOwnerFilterActive(
                allButton
            );

            filterCollection();

        }
    );

}


// ==============================
// 收藏者篩選 active 狀態
// ==============================

function updateOwnerFilterActive(
    activeButton
) {

    const buttons =
        document.querySelectorAll(
            "[data-owner]"
        );


    buttons.forEach(
        function (button) {

            button.classList.remove(
                "active"
            );

        }
    );


    activeButton.classList.add(
        "active"
    );

}


// ==============================
// 從 Supabase 取得收藏品
// ==============================

async function loadCollection() {

    console.log(
        "正在從 Supabase 取得 items..."
    );


    const {
        data,
        error
    } =
        await supabaseClient
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
                        id,
                        name
                    )
                ),

                item_limited_types (
                    limited_types (
                        name
                    )
                )
            `);


    // ==========================
    // 錯誤
    // ==========================

    if (error) {

        console.error(
            "Supabase 讀取失敗：",
            error
        );


        collectionList.innerHTML = `

            <div class="empty-message">

                資料讀取失敗<br>

                請打開 Console 查看錯誤。

            </div>

        `;

        return;

    }


    console.log(
        "Supabase 原始資料：",
        data
    );


    // ==========================
    // 整理資料
    // ==========================

    collectionData =
        (data || []).map(
            function (item) {

                const ownerships =
                    item.ownerships || [];


                const limitedTypes =
                    item.item_limited_types
                        ? item.item_limited_types
                            .map(
                                function (type) {

                                    return type.limited_types
                                        ? type.limited_types.name
                                        : "";

                                }
                            )
                            .filter(Boolean)

                        : [];


                return {

                    id:
                        item.id,

                    name:
                        item.name,

                    image:
                        item.image_url || "",


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


                    ownerships:
                        ownerships

                };

            }
        );


    console.log(
        "整理後收藏資料：",
        collectionData
    );


    updateStats();

    filterCollection();

}


// ==============================
// 判斷某件物品是否被某人收藏
// ==============================

function isOwnedBy(
    item,
    memberId
) {

    return item.ownerships.some(
        function (ownership) {

            return String(
                ownership.member_id
            ) === String(memberId);

        }
    );

}

// ==============================
// 取得收藏者
// ==============================

async function loadMembers() {

    console.log("正在取得 members...");

    // --------------------------
    // 取得所有 members
    // --------------------------

    const {
        data,
        error
    } =
        await supabaseClient
            .from("members")
            .select(`
                id,
                name,
                space_id
            `)
            .order("id");


    // --------------------------
    // 錯誤處理
    // --------------------------

    if (error) {

        console.error(
            "members 讀取失敗：",
            error
        );

        return;

    }


    // --------------------------
    // 儲存成員資料
    // --------------------------

    membersData = data || [];


    console.log(
        "Supabase members：",
        membersData
    );


    // --------------------------
    // 顯示收藏者名稱
    // --------------------------

    const memberNamesElement =
        document.getElementById("memberNames");


    if (memberNamesElement) {

        memberNamesElement.textContent =
            membersData
                .map(function (member) {
                    return member.name;
                })
                .join(" × ");

    }


    // --------------------------
    // 建立收藏者篩選按鈕
    // --------------------------

    renderOwnerFilters();

}








// ==============================
// 顯示收藏品
// ==============================

function renderCollection(data) {

    collectionList.innerHTML = "";


    resultCount.textContent =
        `${data.length} items`;


    // ==========================
    // 沒有結果
    // ==========================

    if (data.length === 0) {

        collectionList.innerHTML = `

            <div class="empty-message">

                找不到符合條件的收藏 ♡

            </div>

        `;

        return;

    }


    // ==========================
    // 每件收藏
    // ==========================

    data.forEach(
        function (item) {

            const card =
                document.createElement("article");


            card.className =
                "item";


            // ======================
            // 圖片
            // ======================

            let imageHTML;


            if (item.image) {

                imageHTML = `

                    <img
                        src="${escapeHTML(item.image)}"
                        alt="${escapeHTML(item.name)}"
                        loading="lazy"
                    >

                `;

            }

            else {

                imageHTML = `

                    <span class="item-image-placeholder">
                        ♡
                    </span>

                `;

            }


            // ======================
            // Tags
            // ======================

            const tags = [];


            if (item.character) {

                tags.push(
                    item.character
                );

            }


            if (item.limitedType) {

                tags.push(
                    item.limitedType
                );

            }


            if (item.region) {

                tags.push(
                    item.region
                );

            }


            const tagsHTML =
                tags.length > 0

                    ? `

                        <div class="tags">

                            ${tags
                                .map(
                                    function (tag) {

                                        return `
                                            <span>
                                                ${escapeHTML(tag)}
                                            </span>
                                        `;

                                    }
                                )
                                .join("")}

                        </div>

                    `

                    : "";


            // ======================
            // 系列
            // ======================

            const seriesHTML =
                item.project

                    ? `

                        <p class="item-series">
                            ${escapeHTML(item.project)}
                        </p>

                    `

                    : "";


            // ======================
            // 收藏者按鈕
            // ======================

            const ownerButtonsHTML =
                membersData
                    .map(
                        function (member, index) {

                            const owned =
                                isOwnedBy(
                                    item,
                                    member.id
                                );


                            let extraClass = "";

                            if (index === 1) {
                                extraClass =
                                    "alice";
                            }


                            return `

                                <button
                                    class="
                                        owner-toggle
                                        ${extraClass}
                                        ${owned ? "owned" : ""}
                                    "

                                    data-item-id="${item.id}"

                                    data-member-id="${member.id}"
                                >

                                    <span class="dot"></span>

                                    ${escapeHTML(member.name)}

                                </button>

                            `;

                        }
                    )
                    .join("");


            // ======================
            // Card HTML
            // ======================

            card.innerHTML = `

                <div class="item-image">

                    ${imageHTML}

                </div>


                <div class="item-info">

                    <h3 class="item-name">
                        ${escapeHTML(item.name)}
                    </h3>


                    ${seriesHTML}


                    ${tagsHTML}


                    <div class="owner-section">

                        <span class="owner-title">
                            OWNED BY
                        </span>


                        <div class="owner-buttons">

                            ${ownerButtonsHTML}

                        </div>

                    </div>

                </div>

            `;


            collectionList.appendChild(
                card
            );

        }
    );


    // ==========================
    // 綁定收藏者按鈕
    // ==========================

    const ownerToggles =
        document.querySelectorAll(
            ".owner-toggle"
        );


    ownerToggles.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    await toggleOwnership(
                        button
                    );

                }
            );

        }
    );

}


// ==============================
// 新增 / 刪除收藏
// ==============================

async function toggleOwnership(
    button
) {

    // 防止連續點擊
    if (button.dataset.loading === "true") {
        return;
    }


    button.dataset.loading = "true";


    const itemId =
        button.dataset.itemId;


    const memberId =
        button.dataset.memberId;


    const item =
        collectionData.find(
            function (item) {

                return String(item.id) ===
                    String(itemId);

            }
        );


    if (!item) {

        button.dataset.loading = "false";

        return;

    }


    const currentlyOwned =
        isOwnedBy(
            item,
            memberId
        );


    // ==========================
    // 取消收藏
    // ==========================

    if (currentlyOwned) {

        console.log(
            "DELETE ownerships:",
            itemId,
            memberId
        );


        const {
            error
        } =
            await supabaseClient
                .from("ownerships")
                .delete()
                .eq(
                    "item_id",
                    itemId
                )
                .eq(
                    "member_id",
                    memberId
                );


        if (error) {

            console.error(
                "取消收藏失敗：",
                error
            );


            alert(
                "取消收藏失敗，請稍後再試。"
            );


            button.dataset.loading =
                "false";

            return;

        }


        // --------------------------
        // 更新前端資料
        // --------------------------

        item.ownerships =
            item.ownerships.filter(
                function (ownership) {

                    return String(
                        ownership.member_id
                    ) !== String(memberId);

                }
            );


        button.classList.remove(
            "owned"
        );

    }


    // ==========================
    // 新增收藏
    // ==========================

    else {

        console.log(
            "INSERT ownerships:",
            itemId,
            memberId
        );


        const {
            data,
            error
        } =
            await supabaseClient
                .from("ownerships")
                .insert({

                    item_id:
                        itemId,

                    member_id:
                        memberId

                })
                .select(`
                    member_id,

                    members (
                        id,
                        name
                    )
                `)
                .single();


        if (error) {

            console.error(
                "新增收藏失敗：",
                error
            );


            alert(
                "新增收藏失敗，請稍後再試。"
            );


            button.dataset.loading =
                "false";

            return;

        }


        // --------------------------
        // 更新前端資料
        // --------------------------

        item.ownerships.push(
            data
        );


        button.classList.add(
            "owned"
        );

    }


    button.dataset.loading =
        "false";


    // ==========================
    // 更新畫面
    // ==========================

    updateStats();

    filterCollection();

}


// ==============================
// 搜尋 + 篩選
// ==============================

function filterCollection() {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    const filteredData =
        collectionData.filter(
            function (item) {


                // ==================
                // 搜尋
                // ==================

                const matchKeyword =
                    item.name
                        .toLowerCase()
                        .includes(keyword);


                // ==================
                // 角色
                // ==================

                const matchCharacter =
                    selectedCharacter === "all" ||
                    item.character ===
                        selectedCharacter;


                // ==================
                // 收藏者
                // ==================

                let matchOwner = true;


                // 全部

                if (
                    selectedOwner === "all"
                ) {

                    matchOwner = true;

                }


                // Both

                else if (
                    selectedOwner === "both"
                ) {

                    matchOwner =
                        membersData.length >= 2 &&
                        membersData.every(
                            function (member) {

                                return isOwnedBy(
                                    item,
                                    member.id
                                );

                            }
                        );

                }


                // 指定收藏者

                else {

                    matchOwner =
                        isOwnedBy(
                            item,
                            selectedOwner
                        );

                }


                return (

                    matchKeyword &&
                    matchCharacter &&
                    matchOwner

                );

            }
        );


    renderCollection(
        filteredData
    );

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
// 角色篩選
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
// 更新統計
// ==============================

function updateStats() {

    const total =
        collectionData.length;


    const owned =
        collectionData.filter(
            function (item) {

                return item.ownerships &&
                    item.ownerships.length > 0;

            }
        ).length;


    const percent =
        total === 0
            ? 0
            : Math.round(
                (owned / total) * 100
            );


    totalCount.textContent =
        total;


    ownedCount.textContent =
        owned;


    progressPercent.textContent =
        `${percent}%`;


    progressBar.style.width =
        `${percent}%`;

}


// ==============================
// HTML Escape
// ==============================

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==============================
// 啟動
// ==============================

async function init() {

    console.log(
        "開始初始化收藏網站..."
    );


    // 先取得 members
    await loadMembers();


    // 再取得 items
    await loadCollection();


    console.log(
        "收藏網站初始化完成。"
    );

}


init();