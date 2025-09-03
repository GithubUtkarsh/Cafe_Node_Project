
         const currentPath = window.location.pathname;

    // Map path to link IDs
    const links = {
        '/dashboard': 'dash-link',
      '/dashboard/addRecipe': 'add-link',
      '/dashboard/viewRecipe': 'view-link',
      '/dashboard/viewContact': 'contact-link',
    };

    const activeLinkId = links[currentPath];
    if (activeLinkId) {
      document.getElementById(activeLinkId).classList.add('active');
    }

        // Sidebar toggle for mobile
        function toggleSidebar() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('show');
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            const sidebar = document.querySelector('.sidebar');
            const sidebarToggle = document.querySelector('.sidebar-toggle');
            
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !sidebarToggle?.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        });

         // Get current URL path
   