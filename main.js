(function() {
	// -------------- DOC SCROLL POSITION ----------------

	function getDocHeight() {
		const D = document;
		return Math.max(
			D.body.scrollHeight,
			//D.documentElement.scrollHeight,
			D.body.offsetHeight,
			//D.documentElement.offsetHeight,
			D.body.clientHeight,
			D.documentElement.clientHeight
			// Elements sticking out from body when (body.overflow = hiddnen) cause the above values to include the elements, preventing isDocAtScrollEnd() from firing
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

	// Distance between touchStart and touchEnd to be considered a swipe
	const SWIPE_SENSITIVITY = 15;

	// Max time from touchStart to touchEnd
	const SWIPE_TIME_LIMIT = 300;

	let touchstartY = 0;
	let swiping = false;

	function handleTouchStart(e) {
		touchstartY = e.touches[0].pageY;
		swiping = true;
		setTimeout(() => (swiping = false), SWIPE_TIME_LIMIT);
	}

	function handleTouchEnd(e) {
		if (!swiping) return;
		const touchendY = e.changedTouches[0].pageY;
		const deltaY = touchendY - touchstartY;
		if (isDocAtScrollEnd() && deltaY < -SWIPE_SENSITIVITY) {
			window.parent.postMessage("down", "*");
		} else if (isDocAtScrollStart() && deltaY > SWIPE_SENSITIVITY) {
			window.parent.postMessage("up", "*");
		}
		// const message =
		// 	deltaY > SWIPE_SENSITIVITY
		// 		? isDocAtScrollStart()
		// 			? "up"
		// 			: ""
		// 		: deltaY < -SWIPE_SENSITIVITY
		// 		? isDocAtScrollEnd()
		// 			? "down"
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
			debouncedMessage("down");
		} else if (isDocAtScrollStart() && e.deltaY < 0) {
			debouncedMessage("up");
		}
	}

	// ------------------- LISTENERS -------------------

	// use `document` and not `window` in case some projects' <html> height is not 100vh
	document.addEventListener("touchstart", handleTouchStart);
	document.addEventListener("touchend", handleTouchEnd);
	document.addEventListener("wheel", handleWheel);
})();
