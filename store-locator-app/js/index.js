let map;
let bangalore = { lat: 12.972442, lng: 77.580643 };
let losAngeles = { lat: 34.06338, lng: -118.35808 };
let mapStyling = [
  {
    featureType: "administrative",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6195a0" }],
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [
      { lightness: "0" },
      { saturation: "0" },
      { color: "#f5f5f2" },
      { gamma: "1" },
    ],
  },
  {
    featureType: "landscape.man_made",
    elementType: "all",
    stylers: [{ lightness: "-3" }, { gamma: "1.00" }],
  },
  {
    featureType: "landscape.natural.terrain",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#bae5ce" }, { visibility: "on" }],
  },
  {
    featureType: "road",
    elementType: "all",
    stylers: [
      { saturation: -100 },
      { lightness: 45 },
      { visibility: "simplified" },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "all",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#fac9a9" }, { visibility: "simplified" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text",
    stylers: [{ color: "#4e4e4e" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#787878" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "transit.station.airport",
    elementType: "labels.icon",
    stylers: [
      { hue: "#0a00ff" },
      { saturation: "-77" },
      { gamma: "0.57" },
      { lightness: "0" },
    ],
  },
  {
    featureType: "transit.station.rail",
    elementType: "labels.text.fill",
    stylers: [{ color: "#43321e" }],
  },
  {
    featureType: "transit.station.rail",
    elementType: "labels.icon",
    stylers: [
      { hue: "#ff6c00" },
      { lightness: "4" },
      { gamma: "0.75" },
      { saturation: "-68" },
    ],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ color: "#eaf6f8" }, { visibility: "on" }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#c7eced" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ lightness: "-49" }, { saturation: "-53" }, { gamma: "0.79" }],
  },
];
let infoWindow;
var markers = [];

const onEnter = (e) => {
  if (e.key == "Enter") {
    getStores();
    console.log(e.key);
  }
};

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: losAngeles,
    zoom: 8,
  });
  infoWindow = new google.maps.InfoWindow();
  map.setOptions = mapStyling;
  getStores();
}

const setStoresList = (stores) => {
  let storesHtml = "";
  stores.map((store, index) => {
    storesHtml += `
        <div class="store-container">
            <div class="store-container-background">
                <div class="store-info-container">
                    <div class="store-address">
                        <span>${store["addressLines"][0]}</span>
                        <span>${store["addressLines"][1]}</span>
                    </div>
                    <div class="store-phone-number">${
                      store["phoneNumber"]
                    }</div>
                </div>
                <div class="store-number-container">
                    <div class="store-number">
                        ${index + 1}
                    </div>
                </div>
            </div>
        </div>
        `;
  });
  document.querySelector(".stores-list").innerHTML = storesHtml;
};

const searchLocationsNear = (stores) => {
  var bounds = new google.maps.LatLngBounds();
  stores.forEach((store, index) => {
    let latlng = new google.maps.LatLng(
      parseFloat(store.location["coordinates"][1]),
      parseFloat(store.location["coordinates"][0])
    );
    let name = store["storeName"];
    let address = store["addressLines"][0];
    let phone = store.phoneNumber;
    let openStatusText = store.openStatusText;

    bounds.extend(latlng);
    createMarker(latlng, name, address, openStatusText, phone, index + 1);
    map.fitBounds(bounds);
  });
};

const getStores = () => {
  const zipCode = document.getElementById("zip-code").value;
  //Adding base condition
  if (!zipCode) {
    return;
  }
  const API_URL = "http://localhost:3000/api/stores";
  const fullUrl = `${API_URL}?zip_code=${zipCode}`;
  fetch(fullUrl)
    .then((response) => {
      if (response.status == 200) {
        return response.json();
      } else {
        throw new Error(response.status);
      }
    })
    .then((data) => {
      if (data.length > 0) {
        clearLocations();
        searchLocationsNear(data);
        setStoresList(data);
        setOnClickListener();
      }else{
        clearLocations();
        noStoresFound();
      }
    });
};

const clearLocations = () => {
  infoWindow.close();
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers.length = 0;
};

const noStoresFound = () => {
    const html = `
    <div class="no-stores-found">
        No Stores Found
    </div>
    `
    document.querySelector('.stores-list').innerHTML = html;
}

const setOnClickListener = () => {
  var storeElements = document.querySelectorAll(".store-container");
  storeElements.forEach((elem, index) => {
    elem.addEventListener("mouseover", () => {
      elem
        .querySelector(".store-number")
        .classList.add("store-number-hover-state");
    });
    elem.addEventListener("mouseout", () => {
      elem
        .querySelector(".store-number")
        .classList.remove("store-number-hover-state");
    });
    elem.addEventListener("click", function () {
      new google.maps.event.trigger(markers[index], "click");
    });
  });
};

const createMarker = (
  latlng,
  name,
  address,
  openStatusText,
  phone,
  storeNumber
) => {
  let googleUrl = new URL("https://www.google.com/maps/dir/");
  googleUrl.searchParams.append("api", "1");
  googleUrl.searchParams.append("destination", address);

  let html = `
        <div class="store-info-window">
            <div class="store-info-name">
                ${name}
            </div>
            <div class="store-info-open-status">
                Open until ${openStatusText}
            </div>
            <div class="store-info-address">
                <div class="icon">
                    <i class="fas fa-location-arrow"></i>
                </div>
                <span>
                <a target="_blank" href="${googleUrl.href}">${address}</a>
                </span>
            </div>
            <div class="store-info-phone">
                <div class="icon">
                    <i class="fas fa-phone-alt"></i>
                </div>
                <span><a href="tel:${phone}">${phone}</a></span>
            </div>
        </div>
    `;
  let marker = new google.maps.Marker({
    position: latlng,
    map: map,
    label: `${storeNumber}`,
  });
  google.maps.event.addListener(marker, "click", function () {
    infoWindow.setContent(html);
    infoWindow.open(map, marker);
  });
  markers.push(marker);
};
