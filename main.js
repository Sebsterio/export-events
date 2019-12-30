(function() {
	// -------------- DOC SCROLL POSITION ----------------

	function getDocHeight() {
		const D = document;
		return Math.max(
			D.body.scrollHeight,
			D.documentElement.scrollHeight,
			D.body.offsetHeight,
			D.documentElement.offsetHeight,
			D.body.clientHeight,
			D.documentElement.clientHeight
		);
	}

	function isDocAtScrollStart() {
		return window.scrollY <= 0;
	}

	function isDocAtScrollEnd() {
		// 1px padding for occasional iframe scaling issues
		return window.scrollY + window.innerHeight >= getDocHeight() - 1;
	}

	// ------------------- SWIPE -------------------

	// distance between touchStart and touchEnd to be considered a swipe
	const SWIPE_SENSITIVITY = 15;

	let touchstartY = 0;
	function handleTouchStart(e) {
		touchstartY = e.touches[0].pageY;
	}

	function handleTouchEnd(e) {
		const touchendY = e.changedTouches[0].pageY;
		const deltaY = touchendY - touchstartY;
		if (isDocAtScrollEnd() && deltaY < -SWIPE_SENSITIVITY) {
			window.parent.postMessage("next", "*");
		} else if (isDocAtScrollStart() && deltaY > SWIPE_SENSITIVITY) {
			window.parent.postMessage("prev", "*");
		}
		// const message =
		// 	deltaY > SWIPE_SENSITIVITY
		// 		? isDocAtScrollStart()
		// 			? "prev"
		// 			: ""
		// 		: deltaY < -SWIPE_SENSITIVITY
		// 		? isDocAtScrollEnd()
		// 			? "next"
		// 			: ""
		// 		: "touch";
		// if (message) window.parent.postMessage(message, "*");
	}

	// ------------------- SCROLL -------------------

	// for debouncing scroll event messages - set high due to trackpad scroll inertia (the only solution I found)
	const SCROLL_MESSAGE_INTERVAL = 2000;

	let timeout;
	let ready = true;

	function debouncedMessage(message) {
		ready = false;
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			ready = true;
		}, SCROLL_MESSAGE_INTERVAL);

		window.parent.postMessage(message, "*");
	}

	// send message only when doc is scrolled to the top/bottom edge and user is scrolling towards the edge
	function handleWheel(e) {
		if (!ready) return;
		if (isDocAtScrollEnd() && e.deltaY > 0) {
			debouncedMessage("next");
		} else if (isDocAtScrollStart() && e.deltaY < 0) {
			debouncedMessage("prev");
		}
	}

	// ------------------- LISTENERS -------------------

	// use `document` and not `window` in case some projects' <html> height is not 100vh
	document.addEventListener("touchstart", handleTouchStart);
	document.addEventListener("touchend", handleTouchEnd);
	document.addEventListener("wheel", handleWheel);
})();