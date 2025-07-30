<script lang="ts">
  import { page } from '$app/state';
	import { t, locale } from 'svelte-i18n';
</script>

{#if $locale}
	<nav aria-label="Main navigation">
		<a href="/" class="nav-link" class:active={page.url.pathname === '/'} aria-current={page.url.pathname === '/' ? 'page' : undefined}>
			{$t('nav.home')}
		</a>
		<a href="/about" class="nav-link" class:active={page.url.pathname === '/about'} aria-current={page.url.pathname === '/about' ? 'page' : undefined}>
			{$t('nav.about')}
		</a>
		<a href="/contact" class="nav-link" class:active={page.url.pathname === '/contact'} aria-current={page.url.pathname === '/contact' ? 'page' : undefined}>
			{$t('nav.contact')}
		</a>
	</nav>
{/if}

<style>
  nav {
    position: absolute;
    top: 2rem;
    right: 2rem;
    display: flex;
    gap: 4rem;
    z-index: 2;
    transition: all 0.3s ease;
  }

  nav a {
    color: rgb(30, 30, 30);
    text-decoration: none;
    font-size: larger;
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
