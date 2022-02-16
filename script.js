const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const tokenId = urlParams.get('tokenId');

document.getElementById("base-image").style.backgroundImage = "url(" + "https://gateway.pinata.cloud/ipfs/QmQX9FFbtefLmn6BH75EtDVk7iqsF5xwD8MWuyQxYU2on6/" + tokenId + ".jpg";
const sv_url = "https://gateway.pinata.cloud/ipfs/QmZVfMvxek9E6yJ2Yw4hb81vxZcXz88cVxWLgoM3NQ467S/" + tokenId + ".glb";
const ios_url = "https://gateway.pinata.cloud/ipfs/QmZVfMvxek9E6yJ2Yw4hb81vxZcXz88cVxWLgoM3NQ467S/" + tokenId + ".usdc";
const ar_button = document.getElementById('ar-button');
ar_button.setAttribute("src", sv_url);
ar_button.setAttribute("ios-src", ios_url);
ar_button.setAttribute("title", "OTLW #0" + tokenId);

const IS_ANDROID = /android/i.test(navigator.userAgent);
const IS_IOS =
  (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const IS_SAFARI = /Safari\//.test(navigator.userAgent);
const IS_FIREFOX = /firefox/i.test(navigator.userAgent);
const IS_OCULUS = /OculusBrowser/.test(navigator.userAgent);
const IS_IOS_CHROME = IS_IOS && /CriOS\//.test(navigator.userAgent);
const IS_IOS_SAFARI = IS_IOS && IS_SAFARI;

const SUPPORTS_SCENEVIEWER = IS_ANDROID && !IS_FIREFOX && !IS_OCULUS;
const SUPPORTS_QUICKLOOK = (() => {
  const anchor = document.createElement("a");
  return anchor.relList && anchor.relList.supports && anchor.relList.supports("ar");
})();

function removeAR() {
  console.error("Removing AR");
  var ar_button = document.getElementById('ar-button');
  ar_button.parentNode.removeChild(ar_button);
  return false;
}

const activateAR = (href, button, isQuickLook) => {

  console.error("Activating AR");

  const anchor = document.createElement("a");
  if (isQuickLook) {
    anchor.appendChild(document.createElement("img"));
    anchor.rel = "ar";
  }
  anchor.setAttribute("href", href);
  anchor.click();
  if (button && isQuickLook) {
    anchor.addEventListener(
      "message",
      (event) => {
        if (event.data == "_apple_ar_quicklook_button_tapped") {
          button.dispatchEvent(new CustomEvent("quick-look-button-tapped"));
        }
      },
      false
    );
  }
};

const initializeArButton = (button) => {

  console.error("Initializing AR");

  if ((IS_IOS_CHROME || IS_IOS_SAFARI) && SUPPORTS_QUICKLOOK) {

    console.error("Apple QuickLook");

    // system supports AR via quick look (on ios this takes precedence on scene viewer)
    button.setAttribute("ar", "quick-look");
    button.dispatchEvent(new CustomEvent("initialized", { detail: "quick-look" }));
    button.addEventListener("click", () => {
      const iosSrc = button.getAttribute("ios-src");
      if (!iosSrc) {
        console.error("Invalid ios-src in <ar-button>: " + button);
        return;
      }

      const applePayButtonType = button.getAttribute("applepay-button-type");
      const checkoutTitle = button.getAttribute("checkout-title");
      const checkoutSubtitle = button.getAttribute("checkout-subtitle");
      const price = button.getAttribute("price");
      const callToAction = button.getAttribute("call-to-action");
      const customBanner = button.getAttribute("custom-banner");
      const customHeight = button.getAttribute("custom-height");
      const noScale = button.getAttribute("no-scale");

      let href = `${iosSrc}#`;

      if (applePayButtonType) {
        href += `&applePayButtonType=${encodeURIComponent(applePayButtonType)}`;
      }
      if (checkoutTitle) {
        href += `&checkoutTitle=${encodeURIComponent(checkoutTitle)}`;
      }
      if (checkoutSubtitle) {
        href += `&checkoutSubtitle=${encodeURIComponent(checkoutSubtitle)}`;
      }
      if (price) {
        href += `&price=${encodeURIComponent(price)}`;
      }
      if (callToAction) {
        href += `&callToAction=${encodeURIComponent(callToAction)}`;
      }
      if (customBanner) {
        href += `&custom=${encodeURIComponent(customBanner)}`;
      }
      if (customHeight) {
        href += `&customHeight=${encodeURIComponent(customHeight)}`;
      }
      if (noScale != null) {
        href += `&allowsContentScaling=0`;
      }

      activateAR(href, button, true);
    });
  } 
  
  else if (SUPPORTS_SCENEVIEWER) {

    console.error("Google SceneViewer");

    // system supports AR via scene viewer
    button.setAttribute("ar", "scene-viewer");
    button.dispatchEvent(new CustomEvent("initialized", { detail: "scene-viewer" }));
    button.addEventListener("click", () => {
      const src = button.getAttribute("src");
      if (!src) {
        console.error("Invalid src in <ar-button>: " + button);
        return;
      }

      const title = button.getAttribute("title");
      const fallbackUrl = button.getAttribute("fallback-url");
      const link = button.getAttribute("link");
      const noScale = button.getAttribute("no-scale");

      let href = `intent://arvr.google.com/scene-viewer/1.0?file=${src}&mode=ar_only`;
      if (title) {
        href += `&title=${encodeURIComponent(title)}`;
      }
      if (link) {
        href += `&link=${encodeURIComponent(link)}`;
      }
      if (noScale != null) {
        href += `&resizable=false`;
      }
      href +=
        `#Intent;scheme=https;` +
        `package=com.google.ar.core;` +
        `action=android.intent.action.VIEW;`;
      if (fallbackUrl) {
        href += `S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};`;
      }
      href += `end;`;

      activateAR(href);
    });
  } 
  
  else {

    // No AR supported on current system, hide the button or sets a fallback url
    /*button.setAttribute("ar", "unsupported");
    button.dispatchEvent(new CustomEvent("initialized", { detail: "unsupported" }));
    if (button.getAttribute("show-if-unsupported") != null) {
      button.addEventListener("click", () => {
        const fallbackUrl = button.getAttribute("fallback-url");
        if (fallbackUrl) {
          activateAR(encodeURIComponent(fallbackUrl));
        }
      });
    } else {
      button.style.display = "none";
    }*/
    console.error("Unsupported");
    removeAR();
  }
};

// go through all ar-button tags on the page and initialize them
console.error("Getting buttons");
const buttons = document.querySelectorAll('ar-button');
for (let i = 0; i < buttons.length; i++) {
  console.error("Button found");
  const button = buttons.item(i);
  initializeArButton(button);
}