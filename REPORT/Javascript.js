// Global Variables
const InvoiceReport = [];
const CEDifferenceReport = [];
const CustomersWithoutOrdersTodayReport = [];
const OrdersThisweekReport = [];
const CustomerListReport = [];

let OrdersThisweekReportOnSearch;
let InvoiceReportOnSearch;
let CustomersWithoutOrdersTodayReportOnSearch;
let CustomerListReportOnSearch;
let CEDifferenceReportOnSearch;

let Count = 0;
let LocationsFilter = "";
let SalesmanFilter = "";
let SelectedSalesman = "";
let SelectedLocation = "";
let isSearch = false;

// Initialization Functions
async function getInitData(api) {
    const request = new ECP.EC_Request(api);
    const records = await request.Submit();
    const recordSet = new ECP.EC_Recordset(records);
    const customers = [];
    switch (api) {
        case "DSDLink_GetInvoices":
            while (!recordSet.EOF) {
                InvoiceReport.push({
                    Date: recordSet.Item("Date"),
                    Customer: recordSet.Item("CustomerNumCompany"),
                    Invoice: recordSet.Item("InvoiceLink"),
                    Debit: recordSet.Item("Debit"),
                    SalesmanID: recordSet.Item("Salesman"),
                    LocationID: recordSet.Item("LocationID")
                });
                recordSet.MoveNext();
            }
            const totalThisWeek = InvoiceReport.reduce((prev, cur) => prev + EC_Fmt.CDec(cur.Debit), 0);
            document.querySelector("#TotalThisWeek .total").innerHTML = `${EC_Fmt.InputFmt(EC_Fmt.Round(totalThisWeek, 2), ECP.DataType._Currency)}`;
            document.querySelector("#TotalThisWeek .loading").style.display = "none";
            document.querySelector("#OrdersThisWeek .total").innerHTML = InvoiceReport.length;
            document.querySelector("#OrdersThisWeek .loading").style.display = "none";
            break;
        case "DSDLink_GetCEDifference":
            while (!recordSet.EOF) {
                CEDifferenceReport.push({
                    LocationID: recordSet.Item("LocationID"),
                    Location: recordSet.Item("Location"),
                    SalesmanID: recordSet.Item("Salesman"),
                    Salesman: recordSet.Item("SalesmanName"),
                    SalesManager: recordSet.Item("SalesManager1"),
                    Customer: recordSet.Item("CustomerNumCompany"),
                    LastYearsCEs: recordSet.Item("LastYearsCEs"),
                    ThisYearsCEs: recordSet.Item("ThisYearsCEs"),
                    PercentageDifference: recordSet.Item("PercentageDifference")
                });
                recordSet.MoveNext();
            }
            break;
        case "DSDLink_GetCustomersWithoutOrdersToday":
            while (!recordSet.EOF) {
                CustomersWithoutOrdersTodayReport.push({
                    Customer: recordSet.Item("Company"),
                    LocationID: recordSet.Item("LocationID"),
                    Location: recordSet.Item("Location"),
                    SalesmanID: recordSet.Item("SalesmanID"),
                    Salesman: recordSet.Item("SalesmanName")
                });
                recordSet.MoveNext();
            }
            document.querySelector("#CustomersWithoutInvoices .total").innerHTML = CustomersWithoutOrdersTodayReport.length;
            document.querySelector("#CustomersWithoutInvoices .loading").style.display = "none";
            break;
        case "DSDLink_GetOrdersThisweek":
            while (!recordSet.EOF) {
                OrdersThisweekReport.push({
                    SalesManager: recordSet.Item("SalesManagerName"),
                    SalesmanID: recordSet.Item("SalesmanID"),
                    Salesman: recordSet.Item("Salesman"),
                    SalesmanUserID: recordSet.Item("AssignedUserID"),
                    Customer: recordSet.Item("CustomerNumCompany"),
                    Product: recordSet.Item("ProductID"),
                    Count: recordSet.Item("Count"),
                    InvoiceID: recordSet.Item("InvoiceID"),
                    InvoiceNum: recordSet.Item("InvoiceNum"),
                    LocationID: recordSet.Item("LocationID"),
                    Location: recordSet.Item("Location"),
                    Cases: recordSet.Item("TotalCases")
                });
                recordSet.MoveNext();
            }
            break;
        case "DSDLink_GetCustomerList":
            while (!recordSet.EOF) {
                if (!customers.includes(recordSet.Item("CustomerID"))) {
                    CustomerListReport.push({
                        LocationID: recordSet.Item("LocationID"),
                        Location: recordSet.Item("Location"),
                        SalesmanID: recordSet.Item("Salesman"),
                        CustomerID: recordSet.Item("CustomerID"),
                        Customer: recordSet.Item("CustomerNumCompany"),
                        LastInvoice: recordSet.Item("LastDSDLinkInvoice"),
                        DaysDeliver: recordSet.Item("DaysSinceLastDSDLinkInvoiceDelivery")
                    });
                    customers.push(recordSet.Item("CustomerID"));
                }

                recordSet.MoveNext();
            }
            break;
    }
}

async function getFusionData(api, location, salesman) {
    const data = [];
    const countTotal = [];
    const request = new ECP.EC_Request(api);
    request.AddParameter("Location", location, ECP.EC_Operator.Equals);
    request.AddParameter("AssignedSalesman", salesman, ECP.EC_Operator.Equals);
    const records = await request.Submit();
    const recordSet = new ECP.EC_Recordset(records);
    switch (api) {
        case "DSDLink_GetNewPlacementsComparison":
            while (!recordSet.EOF) {
                data.push({
                    Product: recordSet.Item("ProductNumName"),
                    Placements: recordSet.Item("Placements")
                });
                recordSet.MoveNext();
            }
            break;
        case "DSDLink_GetNewPlacementsTotal":
            document.querySelector("#NewPlacements .dsd-amt").innerHTML = EC_Fmt.Null2ZeroInt(recordSet.Item("Placements"));
            // document.querySelector("#NewPlacements .sales-rep").innerHTML = EC_Fmt.Null2ZeroInt(recordSet.Item("SalesRep"));
            document.querySelector("#NewPlacements .dsd .loading").style.display = "none";
            // document.querySelector("#NewPlacements .sales .loading").style.display = "none";
            break;
        case "DSDLink_GetCEDifferenceTotal":
            document.querySelector("#CEDifference .total").innerHTML = EC_Fmt.NullChk(recordSet.Item("PercentageDifference"), "0%");
            document.querySelector("#CEDifference .loading").style.display = "none";
            break;
        case "DSDLink_GetCustomerCount":
            document.querySelector("#DSDLinkCustomers .total").innerHTML = EC_Fmt.Null2ZeroInt(recordSet.Item("Count"));
            // document.querySelector("#DSDLinkCustomers .total").innerHTML = EC_Fmt.Null2ZeroInt(CustomerListReport.length);
            document.querySelector("#DSDLinkCustomers .loading").style.display = "none";
            break;
    }
    return data;
}

async function getFilters() {
    const request = new ECP.EC_Request("DSDLink_GetLocationsAndSalesmen");
    const records = await request.Submit();
    const recordSet = new ECP.EC_Recordset(records);
    const locationsArray = [];
    const salesmanArray = [];

    if (recordSet.Records) {
        while (!recordSet.EOF) {
            if (!salesmanArray.includes(`${recordSet.Item("SalesmanID")},${recordSet.Item("SalesmanName")}`)) {
                SalesmanFilter += `${recordSet.Item("SalesmanID")}| ${recordSet.Item("SalesmanName")} ^`;
                salesmanArray.push(`${recordSet.Item("SalesmanID")},${recordSet.Item("SalesmanName")}`);
            }

            if (!locationsArray.includes(`${recordSet.Item("LocationID")},${recordSet.Item("Location")}`)) {
                LocationsFilter += `${recordSet.Item("LocationID")}| ${recordSet.Item("Location")} ^`;
                locationsArray.push(`${recordSet.Item("LocationID")},${recordSet.Item("Location")}`);
            }
            recordSet.MoveNext();
        }
    }
}

// Create View Functions
async function autocompleteFilters(arrVal, id, inputName, curValue) {
    const data = await ECP.HTML.AutoComplete({
        InputName: inputName,
        CurValue: curValue,
        ValuesArr: arrVal,
        CurDisplayValue: "",
        TabIndex: 1,
        IsSearch: true,
        Width: 300
    });

    document.getElementById(id).innerHTML += data;
    document.querySelector(`#${id} input[type='hidden'][name='${inputName}']`).setAttribute("id", `${inputName}Hidden`);
    document.querySelector(`#${id} input[type='text'][KeyValue][DisplayVal][LimitToList]`).setAttribute("id", `${inputName}Input`);
    const ajaxInput = new ECP.HTML.AjaxInput(document.getElementById(`${inputName}Input`));
}

function createTotalThisWeek(data) {
    document.querySelector("#TotalThisWeek-Report .reports-div").innerHTML = "";
    document.getElementById("TotalThisWeek-Report").classList.add("current");
    addHistoryEvent("TotalThisWeek");

    if (data.length === 0) {
        document.querySelector("#TotalThisWeek-Report .reports-div").innerHTML += "<p class=no-data>No records found.</p>";
        document.querySelector("#TotalThisWeek-Report .note").style.display = "none";
        // document.querySelector("#TotalThisWeek .total").innerHTML = "0";
        // document.querySelector("#OrdersThisWeek .total").innerHTML = "0";
    } else {
        const checker = [];
        const product = [];
        const first = [];
        const check = "";

        document.querySelector("#TotalThisWeek-Report .reports-div").innerHTML += "<table>"
            + "<tbody class=report-subtable>"
            + "<tr>"
            + "<td class=p-data-header>Invoice ID</td>"
            + "<td class=p-data-header>Customer</td>"
            + "<td class=p-data-header>Total</td>"
            + "</tr>"
            + "</tbody>"
            + "</table>";

        for (let i = 0, len = data.length; i < len; i++) {
            const { ...row } = data[i];
            const className = `DATE-${row.Date.replace(/\s/g, "").replace("/", "").replace("/", "").replaceAll(".", "")}`;

            if (!checker.includes(className)) {
                document.querySelector("#TotalThisWeek-Report table").innerHTML += `<tbody id=${className}>`
                    + `<td class="p-data-header p-sub-header"colspan=4>${row.Date}</td>`
                    + "<tr>"
                    + `<td class=p-data>${row.Invoice}</td>`
                    + `<td class="p-data w-25">${row.Customer}</td>`
                    + `<td class="p-data text-right">${row.Debit}</td>`
                    + "</tr>"
                    + "</tbody>";
                checker.push(className);
            } else {
                document.querySelector(`#TotalThisWeek-Report #${className}`).innerHTML += "<tr>"
                    + `<td class=p-data>${row.Invoice}</td>`
                    + `<td class="p-data w-25">${row.Customer}</td>`
                    + `<td class="p-data text-right">${row.Debit}</td>`
                    + "</tr>";
            }
        }
    }
    document.getElementById("reports-loading").style.display = "none";
    ECP.Dialog.HideLoading();
}

function createNewPlacements(data) {
    document.querySelector("#NewPlacements-Report .reports-div").innerHTML = "";
    addHistoryEvent("NewPlacements");

    if (data.length === 0) {
        document.querySelector("#NewPlacements-Report .reports-div").innerHTML += "<p class=no-data>No records found.</p>";
        // document.querySelector("#NewPlacements .dsd-amt").innerHTML = "0";
        // document.querySelector("#NewPlacements .sales-rep").innerHTML = "0";
    } else {
        const customers = [];
        document.querySelector("#NewPlacements-Report .reports-div").innerHTML += "<table>"
            + "<tbody class=report-subtable>"
            + "<tr>"
            + "<td class=p-data-header>Product</td>"
            + "<td class=p-data-header># of Placements</td>"
            + "</tr>"
            + "</tbody>"
            + "</table>";
        for (let i = 0, len = data.length; i < len; i++) {
            const { ...row } = data[i];
            document.querySelector("#NewPlacements-Report table").innerHTML += "<tr>"
                    + `<td class="p-data w-25">${row.Product}</td>`
                    + `<td class="p-data text-center">${row.Placements}</td>`
                    + "</tr>";
        }
    }
    document.getElementById("reports-loading").style.display = "none";
    if (document.querySelector(".current")) {
        document.querySelector(".current").classList.remove("current");
    }
    document.getElementById("NewPlacements-Report").classList.add("current");
    ECP.Dialog.HideLoading();
}

function createDSDLinkCustomers(data) {
    document.querySelector("#DSDLinkCustomers-Report .reports-div").innerHTML = "";
    addHistoryEvent("DSDLinkCustomers");

    if (data.length === 0) {
        document.querySelector("#DSDLinkCustomers-Report .reports-div").innerHTML += "<p class=no-data>No records found.</p>";
        // document.querySelector("#DSDLinkCustomers .total").innerHTML = "0";
    } else {
        const locations = [];
        for (let i = 0, len = data.length; i < len; i++) {
            const { ...row } = data[i];
            const className = row.Location.replace(/\s/g, "").replace(/[^a-zA-Z ]/g, "");

            if (!locations.includes(row.Location)) {
                document.querySelector("#DSDLinkCustomers-Report .reports-div").innerHTML += `<table><tbody class="${className} report-subtable"><tr><td class="p-data p-data-header text-center" colspan="4">${row.Location}</td></tr><tr><td class="p-data-header p-sub-header p-data">Customer ID</td><td class="p-data-header p-sub-header p-data">Customer</td><td class="p-data-header p-sub-header p-data"> Last DSDLink Invoice</td><td class="p-data-header p-sub-header p-data">Days Since Last DSDLink Invoice Delivery</td></tr></tbody></table>`;
                locations.push(row.Location);
            }
            // else {
            document.querySelector(`#DSDLinkCustomers-Report .${className}`).innerHTML += `<tr><td class="p-data text-center">${row.CustomerID}</td><td class="p-data text-center">${row.Customer}</td><td class="p-data text-center">${row.LastInvoice}</td><td class="p-data text-center">${row.DaysDeliver}</td></tr>`;
            // }
        }
    }
    document.getElementById("reports-loading").style.display = "none";
    if (document.querySelector(".current")) {
        document.querySelector(".current").classList.remove("current");
    }
    document.getElementById("DSDLinkCustomers-Report").classList.add("current");
    ECP.Dialog.HideLoading();
}

function createOrdersThisWeek(data) {
    document.querySelector("#OrdersThisWeek-Report .reports-div").innerHTML = "";
    addHistoryEvent("OrdersThisWeek");

    const locations = [];
    if (data.length === 0) {
        document.querySelector("#OrdersThisWeek-Report .reports-div").innerHTML += "<p class=no-data>No records found.</p>";
    } else {
        const checker = [];
        const invoices = [];
        let html = "";

        for (let i = 0, len = data.length; i < len; i++) {
            const { ...row } = data[i];
            const className = `CUST${row.Customer.replace(/[^0-9a-z]/gi, "").split(" ").join("")}`;
            const location = row.Location.replace(/[^a-zA-Z ]/g, "").replace("@", "").split(" ").join("");

            if (!locations.includes(row.Location)) {
                document.querySelector("#OrdersThisWeek-Report .reports-div").innerHTML += `<table id=LOC-${location} class="otw-table loc-table">`
                    + "<tbody class=report-subtable>"
                    + "<tr>"
                    + `<td colspan=3 class=p-data-header>${row.Location}</td>`
                    + "</tr>"
                    + "<tr>"
                    + "<td class=p-data-header>Sales Rep</td>"
                    + "<td class=p-data-header>Invoice ID</td>"
                    + "<td class=p-data-header>Total Cases</td>"
                    + "</tr>"
                    + "</tbody>"
                    + "</table>";
                locations.push(row.Location);
            } else {
                if (!checker.includes(row.Customer)) {
                    document.querySelector(`#OrdersThisWeek-Report #LOC-${location}`).innerHTML += `<tbody id=${className}>`
                    + `<td class=p-sub-header colspan=4>${row.Customer}</td>`
                    + "</tbody>";
                    checker.push(row.Customer);
                }
                if (!invoices.includes(row.InvoiceID)) {
                    html = `<td class=p-data>${row.Salesman}</td>`
                    + `<td class=p-data><a href="Home.aspx?DashboardID=158170&KeyValue=${row.InvoiceID}&TableName=Invoice"target=_blank>Invoice ${row.InvoiceID}</a></td>`
                    + `<td class="p-data text-center">${row.Cases}</td>`
                    + "</tr>"
                    + "</tr>";

                    document.querySelector(`#OrdersThisWeek-Report #LOC-${location} #${className} `).innerHTML += html;
                    invoices.push(row.InvoiceID);
                } else {
                    document.querySelector(`#OrdersThisWeek-Report #LOC-${location} #${className}`).innerHTML += "<tr>"
                    + `<td class=p-data>${row.Salesman}</td>`
                    + `<td class=p-data<a href="Home.aspx?DashboardID=158170&KeyValue=${row.InvoiceID}&TableName=Invoice"target=_blank>Invoice ${row.InvoiceID}</a></td>`
                    + `<td class="p-data text-center">${row.Cases}</td>`
                    + "</tr>";
                }
            }
        }
    }

    if (locations.length < 2) {
        const elems = document.querySelectorAll(".loc-table");

        for (let i = 0, len = elems.length; i < len; i++) {
            elems[i].classList.remove("otw-table");
        }
    }
    document.getElementById("reports-loading").style.display = "none";
    if (document.querySelector(".current")) {
        document.querySelector(".current").classList.remove("current");
    }
    document.getElementById("OrdersThisWeek-Report").classList.add("current");
    ECP.Dialog.HideLoading();
}

function createCEDifference(data) {
    document.querySelector("#CEDifference-Report .reports-div").innerHTML = "";

    if (data.length === 0) {
        document.querySelector("#CEDifference-Report .reports-div").innerHTML += "<p class=no-data>No records found.</p>";
        // document.querySelector("#CEDifference .total").innerHTML = "0%";
    } else {
        const locations = [];
        const salesman = [];
        document.querySelector("#CEDifference-Report .reports-div").innerHTML += "<table>"
            + "<tbody class=report-subtable>"
            + "<tr>"
            + "<td class=p-data-header>Customer</td>"
            + "<td class=p-data-header>Last Years CEs</td>"
            + "<td class=p-data-header>This Years CEs</td>"
            + "<td class=p-data-header>% Diff</td>"
            + "</tr>"
            + "</tbody>"
            + "</table>";

        for (let i = 0, len = data.length; i < len; i++) {
            const { ...row } = data[i];
            const className = row.Location.replace(/\s/g, "").replace(/[^a-zA-Z ]/g, "");

            if (!locations.includes(row.Location)) {
                document.querySelector("#CEDifference-Report .reports-div table").innerHTML += `<tbody class="${className} report-subtable">`
                    + "<tr>"
                    + `<td class="p-data-header p-data"colspan=6>${row.Location}</td>`
                    + "</tr>"
                    + "</tbody>";
                locations.push(row.Location);
            } else if (!salesman.includes(row.Salesman)) {
                document.querySelector(`#CEDifference-Report .${className}`).innerHTML += `<tr><td class=p-sub-header colspan=5>Sales Manager: ${row.SalesManager}<br>Sales Rep: ${row.Salesman}</td><tr>`;
                salesman.push(row.Salesman);
            } else {
                document.querySelector(`#CEDifference-Report .${className}`).innerHTML += "<tr>"
                    + `<td class=p-data>${row.Customer}</td>`
                    + `<td class="p-data text-center">${row.LastYearsCEs}</td>`
                    + `<td class="p-data text-center">${row.ThisYearsCEs}</td>`
                    + `<td class="p-data text-center">${row.PercentageDifference}</td>`
                    + "</tr>";
            }
        }
    }
    document.getElementById("reports-loading").style.display = "none";
    if (document.querySelector(".current")) {
        document.querySelector(".current").classList.remove("current");
    }
    document.getElementById("CEDifference-Report").classList.add("current");
    addHistoryEvent("CEDifference");
    ECP.Dialog.HideLoading();
}

function createCustomersWithoutInvoices(data) {
    document.querySelector("#CustomersWithoutInvoices-Report .reports-div").innerHTML = "";
    addHistoryEvent("CustomersWithoutInvoices");

    const locations = [];
    if (data.length === 0) {
        document.querySelector("#CustomersWithoutInvoices-Report .reports-div").innerHTML += "<p class=no-data>No records found.</p>";
        // document.querySelector("#CustomersWithoutInvoices .total").innerHTML = "0";
    } else {
        for (let i = 0, len = data.length; i < len; i++) {
            const { ...row } = data[i];
            const className = row.Location.replace(/\s/g, "").replace(/[^a-zA-Z ]/g, "");

            if (!locations.includes(row.Location)) {
                document.querySelector("#CustomersWithoutInvoices-Report .reports-div").innerHTML += "<table class=min-table>"
                    + `<tbody class="${className} report-subtable">`
                    + `<td class="p-data-header p-data">${row.Location}</td>`
                    + "</tbody>"
                    + "</table>";
                locations.push(row.Location);
            }
            document.querySelector(`#CustomersWithoutInvoices-Report .${className}`).innerHTML += `<tr><td class="p-data text-center">${row.Customer}</td></tr>`;
        }
    }
    document.getElementById("reports-loading").style.display = "none";
    if (document.querySelector(".current")) {
        document.querySelector(".current").classList.remove("current");
    }
    document.getElementById("CustomersWithoutInvoices-Report").classList.add("current");
    ECP.Dialog.HideLoading();
}

// Event Functions
function multiFilter(products, filters) {
    return products.filter(product => Object.entries(filters).every(([filterProperty, filterValues]) => filterValues.includes(product[filterProperty])));
}

function addHistoryEvent(id) {
    Count++;
    let dashboardURL = window.location.href;
    dashboardURL = dashboardURL.split("/");
    dashboardURL = dashboardURL[dashboardURL.length - 1];

    if (dashboardURL.includes("&")) {
        dashboardURL = dashboardURL.substring(0, dashboardURL.indexOf("&"));
    }

    const state = { page_id: `${id}-Report` };
    const url = `${dashboardURL}&${id}-Report&Location=${SelectedLocation}&Salesman=${SelectedSalesman}`;

    window.history.pushState(state, "", url);
}

async function search(id) {
    ECP.Dialog.ShowLoading();
    const totalThisWeek = InvoiceReportOnSearch.reduce((prev, cur) => prev + EC_Fmt.CDec(cur.Debit), 0);
    document.querySelector("#TotalThisWeek .total").innerHTML = `${EC_Fmt.InputFmt(EC_Fmt.Round(totalThisWeek, 2), ECP.DataType._Currency)}`;
    document.querySelector("#TotalThisWeek .loading").style.display = "none";
    document.querySelector("#CustomersWithoutInvoices .total").innerHTML = CustomersWithoutOrdersTodayReportOnSearch.length;
    document.querySelector("#CustomersWithoutInvoices .loading").style.display = "none";
    document.querySelector("#OrdersThisWeek .total").innerHTML = InvoiceReportOnSearch.length;
    document.querySelector("#OrdersThisWeek .loading").style.display = "none";
    // document.querySelector("#DSDLinkCustomers .total").innerHTML = CustomerListReportOnSearch.length;

    await getFusionData("DSDLink_GetNewPlacementsTotal", SelectedLocation, SelectedSalesman);
    await getFusionData("DSDLink_GetCEDifferenceTotal", SelectedLocation, SelectedSalesman);
    await getFusionData("DSDLink_GetCustomerCount", SelectedLocation, SelectedSalesman);
    const newPlacements = await getFusionData("DSDLink_GetNewPlacementsComparison", SelectedLocation, SelectedSalesman);

    switch (id) {
        case "NewPlacements":
            createNewPlacements(newPlacements);
            break;
        case "TotalThisWeek":
            createTotalThisWeek(InvoiceReportOnSearch);
            break;
        case "DSDLinkCustomers":
            createDSDLinkCustomers(CustomerListReportOnSearch);
            break;
        case "OrdersThisWeek":
            createOrdersThisWeek(OrdersThisweekReportOnSearch);
            break;
        case "CEDifference":
            createCEDifference(CEDifferenceReportOnSearch);
            break;
        case "CustomersWithoutInvoices":
            createCustomersWithoutInvoices(CustomersWithoutOrdersTodayReportOnSearch);
            break;
    }
    ECP.Dialog.HideLoading();
}

document.getElementById("to-top").addEventListener("click", (e) => {
    document.querySelector(".dsd-logo").scrollIntoView();
});

document.querySelector(".collapse-element").addEventListener("click", (e) => {
    const expand = " <span id='collapseFilterTitle'>Expand Filter</span> <span class='collapse-icon ews-icon-caretdown'></span>";
    const collapse = " <span id='collapseFilterTitle'>Collapse Filter</span> <span class='collapse-icon ews-icon-insertcolumn'></span>";

    if (document.querySelector(".filter-row").style.display === "none") {
        document.querySelector(".filter-row").style.display = "flex";
        document.querySelector(".collapse-element").innerHTML = collapse;
    } else {
        document.querySelector(".filter-row").style.display = "none";
        document.querySelector(".collapse-element").innerHTML = expand;
    }
});

window.addEventListener("popstate", async (event) => {
    document.querySelector(".current").classList.remove("current");
    const currentURL = window.location.href;
    const splitUrl = window.location.href.split("&");
    const showDiv = splitUrl[1];
    let location = "";
    let salesman = "";

    if (window.location.href.includes("Location")) {
        location = splitUrl[2].replace("Location=", "");
    }

    if (window.location.href.includes("Salesman")) {
        salesman = splitUrl[3].replace("Salesman=", "");
    }

    if ((currentURL.includes("Location") || currentURL.includes("Salesman")) && (SelectedLocation !== location || SelectedSalesman !== salesman)) {
        ECP.Dialog.ShowLoading();
        SelectedLocation = location;
        SelectedSalesman = salesman;
    } else if (!currentURL.includes("Location") && !currentURL.includes("Salesman") && (SelectedLocation !== location || SelectedSalesman !== salesman)) {
        ECP.Dialog.ShowLoading();
        SelectedLocation = "";
        SelectedSalesman = "";
    }

    if (EC_Fmt.isNull(window.history.state)) {
        // await createOrdersThisWeek(OrdersThisweekReport);
        document.getElementById("OrdersThisWeek-Report").classList.add("current");
    } else {
        document.getElementById(showDiv).classList.add("current");
    }
    window.console.log();
});

document.getElementById("FilterResults").addEventListener("click", async (e) => {
    ECP.Dialog.ShowLoading();
    isSearch = true;
    SelectedLocation = document.getElementById("LocationsFilterHidden").value;
    SelectedSalesman = document.getElementById("SalesmanFilterHidden").value;
    const id = document.querySelector(".reports-container .current").getAttribute("id").replace("-Report", "");
    const locationIDArray = SelectedLocation.split("^");
    const salesmanIDArray = SelectedSalesman.split("^");
    const locationFilters = { LocationID: locationIDArray };
    const salesmanFilters = { SalesmanID: salesmanIDArray };

    if (EC_Fmt.isNull(SelectedLocation) && EC_Fmt.isNull(SelectedSalesman)) {
        OrdersThisweekReportOnSearch = OrdersThisweekReport;
        InvoiceReportOnSearch = InvoiceReport;
        CustomersWithoutOrdersTodayReportOnSearch = CustomersWithoutOrdersTodayReport;
        CustomerListReportOnSearch = CustomerListReport;
        CEDifferenceReportOnSearch = CEDifferenceReport;
    } else if (!EC_Fmt.isNull(SelectedLocation) && !EC_Fmt.isNull(SelectedSalesman)) {
        OrdersThisweekReportOnSearch = multiFilter(OrdersThisweekReport, locationFilters);
        InvoiceReportOnSearch = multiFilter(InvoiceReport, locationFilters);
        CustomersWithoutOrdersTodayReportOnSearch = multiFilter(CustomersWithoutOrdersTodayReport, locationFilters);
        CustomerListReportOnSearch = multiFilter(CustomerListReport, locationFilters);
        CEDifferenceReportOnSearch = multiFilter(CEDifferenceReport, locationFilters);

        OrdersThisweekReportOnSearch = multiFilter(OrdersThisweekReportOnSearch, salesmanFilters);
        InvoiceReportOnSearch = multiFilter(InvoiceReportOnSearch, salesmanFilters);
        CustomersWithoutOrdersTodayReportOnSearch = multiFilter(CustomersWithoutOrdersTodayReportOnSearch, salesmanFilters);
        CustomerListReportOnSearch = multiFilter(CustomerListReportOnSearch, salesmanFilters);
        CEDifferenceReportOnSearch = multiFilter(CEDifferenceReportOnSearch, salesmanFilters);
    } else if (!EC_Fmt.isNull(SelectedLocation)) {
        OrdersThisweekReportOnSearch = multiFilter(OrdersThisweekReport, locationFilters);
        InvoiceReportOnSearch = multiFilter(InvoiceReport, locationFilters);
        CustomersWithoutOrdersTodayReportOnSearch = multiFilter(CustomersWithoutOrdersTodayReport, locationFilters);
        CustomerListReportOnSearch = multiFilter(CustomerListReport, locationFilters);
        CEDifferenceReportOnSearch = multiFilter(CEDifferenceReport, locationFilters);
    } else {
        OrdersThisweekReportOnSearch = multiFilter(OrdersThisweekReport, salesmanFilters);
        InvoiceReportOnSearch = multiFilter(InvoiceReport, salesmanFilters);
        CustomersWithoutOrdersTodayReportOnSearch = multiFilter(CustomersWithoutOrdersTodayReport, salesmanFilters);
        CustomerListReportOnSearch = multiFilter(CustomerListReport, salesmanFilters);
        CEDifferenceReportOnSearch = multiFilter(CEDifferenceReport, salesmanFilters);
    }
    await search(id);
    addHistoryEvent(id);
});

document.getElementById("TotalThisWeek").addEventListener("click", (e) => {
    ECP.Dialog.ShowLoading();
    if (document.querySelector(".current")) {
        document.querySelector(".current").classList.remove("current");
    }
    document.getElementById("reports-loading").style.display = "block";
    setTimeout(() => {
        if (isSearch) {
            createTotalThisWeek(InvoiceReportOnSearch);
        } else {
            createTotalThisWeek(InvoiceReport);
        }
    }, 500);
});

document.getElementById("CustomersWithoutInvoices").addEventListener("click", async (e) => {
    ECP.Dialog.ShowLoading();
    if (document.querySelector(".current")) {
        document.querySelector(".current").classList.remove("current");
    }
    document.getElementById("reports-loading").style.display = "block";
    setTimeout(() => {
        if (isSearch) {
            createCustomersWithoutInvoices(CustomersWithoutOrdersTodayReportOnSearch);
        } else {
            createCustomersWithoutInvoices(CustomersWithoutOrdersTodayReport);
        }
    }, 500);
});

document.getElementById("OrdersThisWeek").addEventListener("click", async (e) => {
    ECP.Dialog.ShowLoading();
    if (document.querySelector(".current")) {
        document.querySelector(".current").classList.remove("current");
    }
    document.getElementById("reports-loading").style.display = "block";
    // setTimeout(() => {
    if (isSearch) {
        createOrdersThisWeek(OrdersThisweekReportOnSearch);
    } else {
        createOrdersThisWeek(OrdersThisweekReport);
    }
    // }, 500);
});

document.getElementById("DSDLinkCustomers").addEventListener("click", async (e) => {
    ECP.Dialog.ShowLoading();
    if (document.querySelector(".current")) {
        document.querySelector(".current").classList.remove("current");
    }
    document.getElementById("reports-loading").style.display = "block";
    setTimeout(() => {
        if (isSearch) {
            createDSDLinkCustomers(CustomerListReportOnSearch);
        } else {
            createDSDLinkCustomers(CustomerListReport);
        }
    }, 500);
});

document.getElementById("CEDifference").addEventListener("click", async (e) => {
    ECP.Dialog.ShowLoading();
    if (document.querySelector(".current")) {
        document.querySelector(".current").classList.remove("current");
    }
    document.getElementById("reports-loading").style.display = "block";
    setTimeout(() => {
        if (isSearch) {
            createCEDifference(CEDifferenceReportOnSearch);
        } else {
            createCEDifference(CEDifferenceReport);
        }
    }, 500);
});

document.getElementById("NewPlacements").addEventListener("click", async (e) => {
    ECP.Dialog.ShowLoading();
    if (document.querySelector(".current")) {
        document.querySelector(".current").classList.remove("current");
    }
    document.getElementById("reports-loading").style.display = "block";
    if (isSearch) {
        const newPlacements = await getFusionData("DSDLink_GetNewPlacementsComparison", SelectedLocation, SelectedSalesman);
        createNewPlacements(newPlacements);
    } else {
        const newPlacements = await getFusionData("DSDLink_GetNewPlacementsComparison", "", "");
        createNewPlacements(newPlacements);
    }
});

async function init() {
    await getFilters();
    autocompleteFilters(SalesmanFilter, "salesman-filter", "SalesmanFilter", "");
    autocompleteFilters(LocationsFilter, "locations-filter", "LocationsFilter", "");
    getFusionData("DSDLink_GetNewPlacementsTotal", "", "");
    getFusionData("DSDLink_GetCEDifferenceTotal", "", "");
    getFusionData("DSDLink_GetCustomerCount", "", "");
    await getInitData("DSDLink_GetOrdersThisweek");
    getInitData("DSDLink_GetInvoices");
    getInitData("DSDLink_GetCEDifference");
    getInitData("DSDLink_GetCustomersWithoutOrdersToday");
    getInitData("DSDLink_GetCustomerList");
    if (!isSearch) {
        createOrdersThisWeek(OrdersThisweekReport);
    }
}

init();
