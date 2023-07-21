const btn = document.querySelector("#btn");
const options = document.querySelector("#options");
var total_price = document.querySelector("#total_price");
const separator = ";|;";

var total = 0;
var total_delay = 0;

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
  devis +=
    "\nTotal : " +
    total_price.innerText +
    "€\nDélai : " +
    total_delay +
    " jours";
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
        let title = element.split(separator)[0];
        let price = element.split(separator)[1];
        let delay = element.split(separator)[2];
        // console.log(element);
        let model = opt_model(title, price, delay);
        models.push(model);
        let row = opt(i, model);
        options.innerHTML += row;
      }
      document.querySelectorAll(".opt").forEach((o, index) => {
        o.addEventListener("click", (e) => {
          const elm = e.currentTarget;
          var checkbox = elm.querySelector("input[type=checkbox]");
          if(checkbox.getAttribute("disabled") == "true") return;
          let model = models[index];

          if (!model.selected) {
            console.log(index, model.title, model.price)
            total = total + parseInt(model.price);
            total_delay = total_delay + parseInt(model.delay);
            selected.push(index);
            elm.classList.add("selected");
          } else {
            total = total - parseInt(model.price);
            total_delay = total_delay - parseInt(model.delay);
            selected = selected.filter((e) => e != index);
            elm.classList.remove("selected");
          }
          checkbox.checked = !checkbox.checked;
          model.selected = !model.selected;
          total_price.innerText = total;
        });
      });
      const basic_opt = document.querySelectorAll(".opt")[0];
      basic_opt.click();
      basic_opt
      .querySelector("input[type=checkbox]")
      .setAttribute("disabled", true);
    }
  );
});

function opt(index, model) {
  return `
  <tr class="opt">
    <td>
      <input type="checkbox" id="option_${index}" name="option_${index}" value="option_${index}"><label for="option_${index}">${model.title}</label>
    </td>
    <td><i>(${model.delay} jours)</i></td>
    <td><b>${model.price}€</b></td>
  </tr>
  `;
}

function opt_model(title, price, delay) {
  return { title, price, delay, selected: false };
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
      price = "",
      delay = elm.querySelector(".extra-delay").innerText.match(/\d{1,}/);
    if (index == 0) {
      title = el.replace(elm.querySelector(".extra-delay").innerText, "");
      price = elm.parentElement
        .querySelector(".extra-price")
        .innerText.split("€")[0];
    } else {
      title = el.split("+")[0];
      // price = el.split("+")[1].split("€")[0];
      price = elm.parentElement
        .querySelector(".extra-price")
        .innerText.split("+")[1]
        .split("€")[0];
    }
    // console.log(title, price);
    arr.push(title + separator + price + separator + delay);
  });
  // console.log(arr);
  return arr;
}
