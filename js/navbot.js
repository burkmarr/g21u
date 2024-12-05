import { getSs, setSs } from './common.js'
import { microphone, list, details, options } from './svg-icons.js'

export function navbot () {

  const links = [
    {
      id: 'navbot-link-record',
      href: 'index.html',
      icon: microphone
    },
    {
      id: 'navbot-link-manage',
      href: 'manage.html',
      icon: list
    },
    {
      id: 'navbot-link-edit',
      href: 'manage.html',
      icon: details
    },
    {
      id: 'navbot-link-options',
      href: 'options.html',
      icon: options
    }
  ]

  const navbot = document.getElementById('navbot')
  const navbotInner = document.createElement('div')
  navbotInner.setAttribute('id', 'navbot-inner')
  navbot.appendChild(navbotInner)

  links.forEach(n => {
    const div = document.createElement('div')
    div.classList.add('main-nav')
    if(n.id === getSs('mainNav')) {
      div.classList.add('selected-nav')
    }
    navbotInner.appendChild(div)
    div.innerHTML = `<svg id="${n.id}" viewBox="${n.icon.viewBox}" class="navbar-icon">${n.icon.svgEls}</svg>`
  
    // Handle highlighting of clicked div
    div.addEventListener('click', function(e){
      setSs('mainNav', e.target.id)
      // Take selected class off all divs
      const navs = document.getElementsByClassName("main-nav")
      for (let i = 0; i < navs.length; i++) {
        navs[i].classList.remove('selected-nav')
      }
      // Add selected class to the clicked div
      div.classList.add('selected-nav')
  
      navigateTo(n.href)
    })
  })
}

function navigateTo(href) {
  window.location.href =href
}