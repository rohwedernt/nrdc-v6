<script lang="ts">
  import { page } from '$app/state';
	import { t, locale } from 'svelte-i18n';
	import { goto } from '$app/navigation';

	function handleNavClick(event: MouseEvent, route: string) {
		event.preventDefault();
		const currentPath = page.url.pathname;
		const targetPath = currentPath === route ? '/' : route;
		goto(targetPath);
	}
</script>

{#if $locale}
	<nav aria-label="Main navigation">
		<a href="/about" class:active={page.url.pathname === '/about'} aria-current={page.url.pathname === '/about' ? 'page' : undefined} on:click={(e) => handleNavClick(e, '/about')}>
			{$t('nav.about')}
		</a>
		<a href="/contact" class:active={page.url.pathname === '/contact'} aria-current={page.url.pathname === '/contact' ? 'page' : undefined} on:click={(e) => handleNavClick(e, '/contact')}>
			{$t('nav.contact')}
		</a>
	</nav>
{/if}

<style>
  nav {
    position: absolute;
    top: 1rem;
    right: 2rem;
    display: flex;
    gap: 5rem;
    z-index: 2;
    transition: all 0.3s ease;
  }

  nav a {
    color: rgb(30, 30, 30);
    text-decoration: none;
    font-size: x-large;
  }

  nav a:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  nav a.active {
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  /* Mobile breakpoint adjustment */
  @media (max-width: 785px) {
    nav {
      display: flex;
      flex-direction: column;
      width: fit-content;
      bottom: 1rem;
      left: 1rem;
      justify-content: flex-end;
      gap: 1rem;
    }

    nav a {
      color: rgb(17, 22, 31);
      font-size: xx-large;
    }

    nav a:hover {
      text-underline-offset: 5px;
      text-decoration-thickness: 2px;
    }

    nav a.active {
      text-underline-offset: 5px;
      text-decoration-thickness: 2px;
    }
  }
</style>
