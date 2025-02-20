import { getSs, setSs, getUrlParam } from './common.js'
import { microphone, list, details, options, csv, help } from './svg-icons.js'

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
      //href: location.pathname,
      href: 'manage.html?small=edit',
      icon: details,
      disabledFor: ['index.html', 'options.html', 'help.html']
    },
    {
      id: 'navbot-link-csv',
      href: 'csv.html',
      icon: csv
    },
    {
      id: 'navbot-link-options',
      href: 'options.html',
      icon: options
    },
    {
      id: 'navbot-link-help',
      href: 'help.html',
      icon: help
    }
  ]

  const navbot = document.getElementById('navbot')
  const navbotInner = document.createElement('div')
  navbotInner.setAttribute('id', 'navbot-inner')
  navbot.appendChild(navbotInner)

  //console.log(location.pathname)
  links.forEach(n => {
    const div = document.createElement('div')
    div.classList.add('main-nav')
    //if(n.id === getSs('mainNav')) {
    if (`${location.pathname}${location.search}` === `/${n.href}` || (location.pathname === `/${n.href}` && n.href === 'help.html')) {
      div.classList.add('selected-nav')
    //   console.log('MATCH', `${location.pathname}${location.search}`, `/${n.href}`)
    // } else {
    //   console.log('no match', `${location.pathname}${location.search}`, `/${n.href}`)
    }
    navbotInner.appendChild(div)
    div.innerHTML = `<svg id="${n.id}" viewBox="${n.icon.viewBox}" class="navbar-icon">${n.icon.svgEls}</svg>`
  
    const disabled = n.disabledFor ? n.disabledFor.some(href => location.href.endsWith(href)) : false

    if (disabled) {
      const svg = document.getElementById(`${n.id}`)
      svg.classList.add('disabled')
    } else {
      div.addEventListener('click', function(e){
        //setSs('mainNav', e.target.id)
        // Take selected class off all divs
        // const navs = document.getElementsByClassName("main-nav")
        // for (let i = 0; i < navs.length; i++) {
        //   navs[i].classList.remove('selected-nav')
        // }
        //div.classList.add('selected-nav')
        window.location.href = n.href
      })
    }
  })
}