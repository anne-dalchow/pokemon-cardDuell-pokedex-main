/**
 * Toggles the navigation menu visibility when the menu button is clicked.
 * @type {HTMLElement}
 */
const menuToggle = document.querySelector('#menu-toggle');

/**
 * The navigation links container element.
 * @type {HTMLElement}
 */
const navLinks = document.querySelector('.nav-links');

/**
 * Adds a click event listener to the menu toggle button to show or hide navigation links.
 * @returns {void}
 */
menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});