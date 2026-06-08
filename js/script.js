const showMenu = (toggleId, navId) =>{
    const toggle = document.getElementById(toggleId),
        nav = document.getElementById(navId)
    toggle.addEventListener('click', () =>{

        // Adiciona o mostrar o menu na nav
        nav.classList.toggle('show-menu')

        //Adiciona o mostrar o icon para mostrar e esconde o menu icon
        toggle.classList.toggle('show-icon')
    
    })
}
showMenu('nav-toggle','navMenu')

const lightbox = GLightbox({
    loop : true
})