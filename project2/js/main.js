// Events on load
window.onload = (e) => {
    document.querySelector("#search").onchange = getResult
    document.querySelector("#get-more").onclick = getMore

    // When relevance is clicked, change search event method to getResult
    document.querySelector("#relevance").onclick = (event) => {
        event.preventDefault()
        document.querySelector("#search").onchange = getResult
    }

    // When trending is clicked, change search event method to getTrending
    document.querySelector("#trending").onclick = (event) => {
        event.preventDefault()
        document.querySelector("#search").onchange = getTrending
    }
};

// Starter variables
let displayTerm = "";
let navWord = "";
let GIPHY_URL = "";
let GIPHY_KEY = "2o98VKLNj1kxmN1x0Sse32mmrOO2N4O1"; // Personal GIPHY API Key
let limit = 10;
let imageList = [];

// Whenever relevance is used
function getResult(){
    // Update navWord to "search" and apply it to GIPHY_URL
    navWord = "search";
    GIPHY_URL = `https://api.giphy.com/v1/gifs/${navWord}?`;

    // Reset imageList
    imageList.length = 0;

    // Reset limit to 10 for every new search
    limit = 10;

    let url = GIPHY_URL + "api_key=" + GIPHY_KEY;

    // Get searchedTerm and save it to displayTerm
    let searchedTerm = document.querySelector("#search").value;
    displayTerm = searchedTerm;
    searchedTerm = encodeURIComponent(searchedTerm);

    // Ends function prematurely if the searchbar is empty
    if(searchedTerm.length<1) return;

    url += "&q=" + searchedTerm + "&limit=" + limit;

    // Display loading text for status and content
    document.querySelector("#status").innerHTML = `<b>Searching for \"${displayTerm}\" </b>`;
    document.querySelector("#content").innerHTML = `<div id='buffer'><img src='images/buffer-spinner.gif' height='300px' width='300px'/></div>`;

    console.log(url);
    getData(url);
}

// Whenever Get More is clicked, be it relevance or trending
function getMore(){
    // Reset imageList
    imageList.length = 0;

    // Add 10 additional images and keeps the max limit 50
    limit += 10;
    if(limit > 50) limit = 50;
    let url = GIPHY_URL + "api_key=" + GIPHY_KEY;

    // Save displayTerm to searchedTerm
    let searchedTerm = displayTerm;
    searchedTerm = encodeURIComponent(searchedTerm);

    // Ends function prematurely if the searchbar is empty
    if(searchedTerm.length<1) return;

    url += "&q=" + searchedTerm + "&limit=" + limit;

    // Display loading text for status and content
    document.querySelector("#status").innerHTML = `<b>Searching for \"${displayTerm}\"</b>`;
    document.querySelector("#content").innerHTML = `<div id='buffer'><img src='images/buffer-spinner.gif' height='300px' width='300px'/></div>`;

    console.log(url);
    getData(url);
}

// Whenever trending is used
function getTrending(){
    // Update navWord to "trending" and apply it to GIPHY_URL
    navWord = "trending";
    GIPHY_URL = `https://api.giphy.com/v1/gifs/${navWord}?`;

    // Reset imageList
    imageList.length = 0;

    // Reset limit to 10 for every new search
    limit = 10;

    let url = GIPHY_URL + "api_key=" + GIPHY_KEY;

    // Save navWord ("trending") to searchedTerm and save it to displayTerm
    let searchedTerm = navWord;
    displayTerm = searchedTerm;
    searchedTerm = encodeURIComponent(searchedTerm);

    url += "&q=" + searchedTerm + "&limit=" + limit;

    // Display loading text for status and content
    document.querySelector("#status").innerHTML = `<b>Searching for ${displayTerm} GIFs</b>`;
    document.querySelector("#content").innerHTML = `<div id='buffer'><img src='images/buffer-spinner.gif' height='300px' width='300px'/></div>`;

    console.log(url);
    getData(url);
}

// Gets information from URL and applies to loadedData
function getData(url){
    let xhr = new XMLHttpRequest();
    xhr.onload = loadedData;
    xhr.onerror = errorMessage;
    xhr.open("GET", url);
    xhr.send();
}

// Loads GIFs
function loadedData(e){
    // Get information from getData
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText);

    // Check if there are no found GIFs
    if((!obj.data || obj.data.length == 0)){
        document.querySelector("#status").innerHTML = `No results found for <i>\"${displayTerm}\"</i>`;
        document.querySelector("#content").innerHTML = `<div id='no-image-found'><img src='images/no-image-found.jpg' height='100px' width='100px'/></div>`;
        return;
    }

    // Save obj.data to searchResults
    let searchResults = obj.data;
    let longString = "";

    // Loop through searchResults and add appropriate information for each GIF
    for(let i=0; i<searchResults.length; ++i){
        let result = searchResults[i];

        let smallURL = result.images.fixed_width.url;
        if (!smallURL) smallURL = "images/no-image-found.jpg";

        let url = result.url;
        let rating = result.rating.toUpperCase();

        let line = `<div class='result'>
        <img src='${smallURL}' title= '${result.id}' />
        <span><a target='_blank' href='${url}' >View on GIPHY</a></span>
        <span>Rating: ${rating}</span></div>`;
        longString += line;
        imageList.push(line);
    }

    // Save longString to the appropriate href
    switch(navWord){
        case "search":
            document.querySelector("#relevance").href = longString;
            console.log(longString);
            break;
        case "trending":
            document.querySelector("#trending").href = longString;
            console.log(longString);
            break;
    }

    // Save longString to content and display loaded text for status
    document.querySelector("#content").innerHTML = longString;
    document.querySelector("#status").innerHTML = `Success! &nbsp <i>Here are ${searchResults.length} results for \"${displayTerm}\"</i>`;

    // Only show Get More button after a search is made and stop at 50 search results
    if(limit < 50 && (imageList.length == limit)){
        document.querySelector('button#get-more').style.cssText = "display: inline-block; border-style: solid; border-radius: 50px; padding: 10px 100px; cursor: pointer;";
    } else{
        document.querySelector('button#get-more').style.cssText = "display: none;";
    }
}

// If there is an error, display in console
function errorMessage(e){
    console.log("There was an error");
}