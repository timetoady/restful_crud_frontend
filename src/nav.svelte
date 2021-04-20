<script>
  import { Router, Route, Link } from "svelte-routing";
  import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
  } from "sveltestrap";
  export let url = "";
  let isOpen = false;
  import { currentPath } from "./stores.js";
  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }
</script>

<header>
  <Navbar color="light" light expand="md">
    <NavbarBrand href="/">timetoady's mangAnime</NavbarBrand>
    <NavbarToggler on:click={() => (isOpen = !isOpen)} />
    <Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
      <Nav class="ml-auto" navbar>
        <Router {url}>
          <NavItem>
            {#if $currentPath === "manga"}
              <NavLink href="/">anime</NavLink>
            {:else}
              <NavLink><Link to="manga">manga</Link></NavLink>
            {/if}
          </NavItem>
          <NavItem>
            <NavLink href="https://github.com/bestguy/sveltestrap"
              >GitHub</NavLink
            >
          </NavItem>
        </Router>
      </Nav>
    </Collapse>
  </Navbar>
</header>
