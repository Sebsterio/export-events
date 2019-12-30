# Export Events

This module allows the page that includes it to send scroll message events to it's host while embedded as an iframe.

Message is sent when window is scrolled to either vertical edge of document and user scrolls further towards the edge, i.e. out of the document.

### Intended use

The messages allow the host page to scroll to the next/previous iframe, which wouldn't be possible otherwise as it wouldn't register scroll events

### Notes

scroll-to-next-page logic is handled here as trackpad scroll inertia requires the scroll function to be debounced, which would make sending lower-level messages ('scrolled-up-at-top-edge' rather than 'prev') messy.

### Issues

#### Trackpad scroll inertia keeps sending scroll event messages

attempted solutions:

- window.parent: on scroll out, kill iframe script
  _ add attribute 'sandbox': no effect;
  _ iframe src='': no effect

final solution:

- debounce scroll-to-next-page messages: works but will freeze the scroll functionality when user scrolls out and immediatley back into the same frame within 2 seconds.
