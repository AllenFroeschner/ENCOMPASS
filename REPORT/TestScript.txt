/* eslint-disable */
var assert = chai.assert;
var expect = chai.expect;

describe("getFusionData", () => {
    const api = "DSDLink_GetOrdersThisweek";
    const location = "3^4";
    const salesman = "";

    it("API should have value", async () => {
        await getFusionData(api, location, salesman);
        await getFusionData("DSDLink_GetNewPlacementsComparison", location, salesman);
        await getFusionData("DSDLink_GetCEDifferenceTotal", location, salesman);
        await getFusionData("DSDLink_GetNewPlacementsTotal", location, salesman);
        await getFusionData("DSDLink_GetCustomerCount", location, salesman);


        await getInitData("DSDLink_GetInvoices");
        await getInitData("DSDLink_GetCEDifference");
        await getInitData("DSDLink_GetCustomersWithoutOrdersToday");
        await getInitData("DSDLink_GetCustomerList");
        await getInitData("DSDLink_GetOrdersThisweek");
        assert.isNotNull(api);
    }).timeout(90000);

    it("location should be defined", async () => {
        await getFusionData(api, location, salesman);
        assert.isDefined(api);
    });

    it("salesman should be defined", async () => {
        await getFusionData(api, location, salesman);
        assert.isDefined(api);
    });
});

describe("Test script for DSDLink_GetNewPlacementsTotal", function () {
    const api = "DSDLink_GetNewPlacementsTotal";
    const location = "";
    const salesman = "";

    it("should insert elements", async () => {
        let html = "";
        const data = getFusionData(api, location, salesman);
        const getCreated = await createOrdersThisWeek(data);
        const getHtml = document.querySelector("#NewPlacements .dsd-amt").innerHTML;
        assert.isDefined(getHtml);
    });

    it("API should have value", () => {
        getFusionData(api, location, salesman);
        assert.isNotNull(api);
    });

    it("location should be defined", () => {
        getFusionData(api, location, salesman);
        assert.isDefined(api);
    });

    it("salesman should be defined", () => {
        getFusionData(api, location, salesman);
        assert.isDefined(api);
    });
});


describe("Test script for createOrdersThisWeek", function () {
    it("should insert elements", async () => {
        let html = "";
        const data = getFusionData("DSDLink_GetOrdersThisweek", "", "");
        const getCreated = await createOrdersThisWeek(data);
        const getHtml = document.querySelector("#OrdersThisWeek-Report .reports-div").innerHTML;
        assert.isDefined(getHtml);

        const myButton = document.getElementById("FilterResults");
        EC_Fmt.TriggerEvent(myButton, "click");
    });
});


describe("Test script for createTotalThisWeek", function () {
    it("should insert elements", async () => {
        let html = "";
        const data = getInitData("DSDLink_GetInvoices", "", "");
        const getCreated = await createTotalThisWeek(data);
        const getHtml = document.querySelector("#TotalThisWeek-Report .reports-div").innerHTML;
        assert.isDefined(getHtml);

    });
});

describe("Test script for createCEDifference", function () {
    it("should insert elements", async () => {
        let html = "";
        const data = getInitData("DSDLink_GetCEDifference", "", "");
        const getCreated = await createCEDifference(data);
        const getHtml = document.querySelector("#CEDifference-Report .reports-div").innerHTML;
        assert.isDefined(getHtml);
    });
});

describe("Test script for createNewPlacements", function () {
    const data = getFusionData("DSDLink_GetNewPlacementsComparison", "", "");
    it("should insert elements", async () => {
        let html = "";
        const getCreated = await createNewPlacements(data);
        const getHtml = document.querySelector("#NewPlacements-Report .reports-div").innerHTML;
        assert.isDefined(getHtml);
    });
});

describe("Test script for createCustomerWithoutInvoices", function () {
    it("should insert elements", async () => {
        let html = "";
        const data = getFusionData("DSDLink_GetCustomersWithoutOrdersToday", "", "");
        const getCreated = await createCustomersWithoutInvoices(data);
        const getHtml = document.querySelector("#CEDifference-Report .reports-div").innerHTML;
        assert.isDefined(getHtml);
    });
});


describe("Test script for createCustomerList", function () {
    it("should insert elements", async () => {
        let html = "";
        const data = getInitData("DSDLink_GetCustomerList", "", "");
        const getCreated = await createDSDLinkCustomers(data);
        const getHtml = document.querySelector("#DSDLinkCustomers-Report .reports-div").innerHTML;
        assert.isDefined(getHtml);
    });

});

describe("Test scripts for collapse filters click event", function () {
    const button = document.querySelector(".collapse-element");
    const expand = " <span id='collapseFilterTitle'>Expand Filter</span> <span class='collapse-icon ews-icon-caretdown'></span>";
    const collapse = " <span id='collapseFilterTitle'>Collapse Filter</span> <span class='collapse-icon ews-icon-insertcolumn'></span>";
    const div = document.querySelector(".filter-row");
    EC_Fmt.TriggerEvent(button, "click");

    if (document.querySelector(".filter-row").style.display === "none") {
        it("display row filters", () => {
            assert(div.style.display = "flex");
        });
    } else {
        it("hide row filters", () => {
            assert(div.style.display = "none");
        });
    }
});

describe("Test scripts for to-top click event", function () {
    const button = document.getElementById("to-top");
    const dsd = document.getElementById("dsd-logo");
    EC_Fmt.TriggerEvent(button, "click");
    it("scroll to top", () => {
        assert.isDefined(dsd);
    });
});

// describe("Test scripts for addClickEvent", function () {
//     const button = document.getElementById("NewPlacements");
//     const tab = document.getElementById("NewPlacements-Report");
//     const current = document.querySelector("current");

//     it("should add class current to tab", function () {
//         EC_Fmt.TriggerEvent(button, "click");
//         addClickEvent();
//         // assert(tab.classList.contains("current"));
//     });
// });

// describe("Test scripts for addHistoryEvent", function () {
//     const button = document.getElementById("NewPlacements");
//     const tab = document.getElementById("NewPlacements-Report");
//     const current = document.querySelector("current");

//     it("should add class current to tab", function () {
//         EC_Fmt.TriggerEvent(button, "click");
//         addHistoryEvent(tab);
//         assert(tab.classList.contains("current"));
//     });
// });

describe("Test scripts for getFilters", function () {
    const locationsArray = [];
    let locationsFilter = "";
    const salesmanArray = [];
    let salesmanFilter = "";
    getFilters();

    it("locationsFilter should be defined", function () {
        assert.isDefined(locationsFilter);
    });

    it("locationFilter should be defined", function () {
        assert.isDefined(salesmanFilter);
    });

    it("salesmanArray should be defined", function () {
        assert.isDefined(salesmanArray);
    });
    it("locationsArray should be defined", function () {
        assert.isDefined(locationsArray);
    });
});

describe("Test Click KPI Cards", () => {
    it("NewPlacements KPI Card", () => {
        const myButton = document.getElementById("NewPlacements");
        EC_Fmt.TriggerEvent(myButton, "click");
    });
    it("TotalThisWeek KPI Card", () => {
        const myButton = document.getElementById("TotalThisWeek");
        EC_Fmt.TriggerEvent(myButton, "click");
    });
    it("DSDLinkCustomers KPI Card", () => {
        const myButton = document.getElementById("DSDLinkCustomers");
        EC_Fmt.TriggerEvent(myButton, "click");
    }).timeout(10000);
    it("OrdersThisWeek KPI Card", () => {
        const myButton = document.getElementById("OrdersThisWeek");
        EC_Fmt.TriggerEvent(myButton, "click");
    });
    it("CEDifference KPI Card", () => {
        const myButton = document.getElementById("CEDifference");
        EC_Fmt.TriggerEvent(myButton, "click");
    });
    it("CustomersWithoutInvoices KPI Card", () => {
        const myButton = document.getElementById("CustomersWithoutInvoices");
        EC_Fmt.TriggerEvent(myButton, "click");
    });
});

describe("Test for on click filter", async () => {
    const myButton = document.getElementById("FilterResults");
    EC_Fmt.TriggerEvent(myButton, "click");

    expect(myButton).to.not.equal(null);
    expect(myButton).to.not.equal(undefined);
    assert(myButton.id == "FilterResults");

    it("search 1", async () => {
        SelectedLocation = "3^4";
        SelectedSalesman = "1627^35^71530";
        await search("DSDLinkCustomers");
        const myButton = document.getElementById("FilterResults");
        EC_Fmt.TriggerEvent(myButton, "click");
    }).timeout(30000);

    it("search 2", async () => {
        SelectedLocation = "3^4";
        SelectedSalesman = "";
        await search("DSDLinkCustomers");
        const myButton = document.getElementById("FilterResults");
        EC_Fmt.TriggerEvent(myButton, "click");
    }).timeout(10000);

    // it("search 3", async () => {
    //     SelectedLocation = "";
    //     SelectedSalesman = "1627^35^71530";
    //     await search("DSDLinkCustomers");
    //     const myButton = document.getElementById("FilterResults");
    //     EC_Fmt.TriggerEvent(myButton, "click");
    // }).timeout(10000);

    it("search 4", async () => {
        SelectedLocation = "";
        SelectedSalesman = "";
        await search("DSDLinkCustomers");
        const myButton = document.getElementById("FilterResults");
        EC_Fmt.TriggerEvent(myButton, "click");
    }).timeout(10000);
});

describe("Test for popstate event", () => {
    const myButton = document.getElementById("OrdersThisWeek");
    EC_Fmt.TriggerEvent(myButton, "click");

    it("should not return an error", async function () {
        await autocompleteFilters("1 | Test 1 ^ 2 | Test 2 ^", "test3-filter", "Test3Filter", "");
    }).timeout(9000);

    it("should not return an error", async function () {
        await autocompleteFilters("1 | Test 1 ^ 2 | Test 2 ^", "test4-filter", "Test4Filter", "");
    }).timeout(9000);

    it("history back", () => {
        history.back();
        window.onbeforeunload = function () { return "Your work will be lost."; };
    })
});

describe("Test for Auto Complete Filters", () => {
    it("should not return an error", async function () {
        await autocompleteFilters("1 | Test 1 ^ 2 | Test 2 ^", "test-filter", "TestFilter", "");
    }).timeout(9000);

    it("should not return an error", async function () {
        await autocompleteFilters("1 | Test 1 ^ 2 | Test 2 ^", "test2-filter", "Test2Filter", "");
    }).timeout(9000);
});

describe("Initialize", () => {
    it("init", () => {
        init();
    });
});
