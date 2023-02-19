const btn = document.querySelector("#btn");
const options = document.querySelector("#options");
var total_price = document.querySelector("#total_price");
const separator = ";|;";

var total = 0;

var models = [];
var selected = [];
var devis = "";

btn.addEventListener("click", () => {
  // copier le devis dans le presse papier
  devis = "";
  selected.forEach((index) => {
    let model = models[index];
    devis += model.title + " : " + model.price + "€\n";
  });
  devis += "\nTotal : " + total_price.innerText + "€";
  btn.innerHTML = document.execCommand("copy")
    ? "Copié avec succès"
    : "Erreur de copie";

  setTimeout(() => {
    btn.innerHTML =
      " Générer le devis de &nbsp; <span id='total_price'>" +
      total +
      "</span>&nbsp;€";
    total_price = document.querySelector("#total_price");
  }, 2000);
});

window.addEventListener("copy", function (event) {
  event.preventDefault();
  if (event.clipboardData) {
    event.clipboardData.setData("text/plain", devis);
    console.log(event.clipboardData.getData("text"));
  }
});

/**
 * @returns l'onglet actif de chrome
 */
async function getCurrentTab() {
  let queryOptions = {
    active: true,
    lastFocusedWindow: true,
  };

  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
getCurrentTab().then((tab) => {
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: get_all_opts,
    },
    (output) => {
      let opts = output[0].result;
      for (let i = 0; i < opts.length; i++) {
        const element = opts[i];
        let title = element.split(separator)[0].split("\n").join("");
        let price = element.split(separator)[1];
        let model = opt_model(title, price);
        models.push(model);
        let row = opt(i, model);
        options.innerHTML += row + "<br>";
      }
      document.querySelectorAll(".opt").forEach((elm, index) => {
        elm.addEventListener("click", (e) => {
          let model = models[index];
          if (elm.checked) {
            total = total + parseInt(model.price);
            selected.push(index);
          } else {
            total = total - parseInt(model.price);
            selected = selected.filter((e) => e != index);
          }
          total_price.innerText = total;
        });
      });
    }
  );
});

function opt(index, model) {
  return `<input type="checkbox" class="opt" id="option_${index}" name="option_${index}" value="option_${index}">
  <label for="option_${index}">${model.title} | ${model.price}€</label>
  `;
}

function opt_model(title, price) {
  return { title, price };
}

function get_all_opts() {
  console.clear();
  const separator = ";|;";

  let arr = [];
  document.querySelectorAll(".tableOption-label").forEach((elm, index) => {
    if (
      elm.tagName.toLocaleLowerCase() == "label" &&
      elm.getAttribute("for") == "checkbox-delivery-express"
    )
      return;
    let el = elm.innerText;

    let title = "",
      price = "";
    if (index == 0) {
      title = el.split("pour")[0];
      if (el.split("pour").length == 1) {
        title = title.replace(elm.querySelector(".extra-delay").innerText, "");
        price = elm.parentElement
          .querySelector(".extra-price")
          .innerText.split("€")[0];
      } else price = el.split("pour")[1].split("€")[0];
    } else {
      title = el.split("+")[0];
      price = el.split("+")[1].split("€")[0];
    }
    // console.log(title, price);
    arr.push(title + separator + price);
  });
  // console.log(arr);
  return arr;
}
