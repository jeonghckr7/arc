import React from "react";
import { useAuth } from "./use-auth.js";

function Navbar(props) {
    const auth = useAuth();

    return (
        <NavbarContainer>
            <Logo />
            <Menu>
            <Link to="/about">about</Link>
            <Link to="/contact">Contact</Link>
            {auth.user ? (
                <Fragment>
                    <Link to="/account">Account ({auth.user.email})</Link>
                    <Button onClick={() => auth.signout()}>Signout</Button>
                </Fragment>
            ) : (
                <Link to="/signin">Signin</Link>
            )}            
            </Menu>
        </NavbarContainer>
    );
}