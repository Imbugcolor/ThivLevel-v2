import React, { useContext } from "react";
import { Breadcrumbs as MUIBreadcrumbs, Link, Typography } from "@material-ui/core";
import { withRouter } from "react-router-dom";
import { IoMdHome as HomeIcon } from "react-icons/io" 
import { GlobalState } from "../../GlobalState";

const Breadcrumbs = props => {
  const state = useContext(GlobalState)
  const [products] = state.productsAPI.allProducts

  const {
    history,
    location: { pathname }
  } = props;
  const pathnames = pathname.split("/").filter(x => x);

  if(pathnames.length <= 0 ) return null

  return (
    
    <MUIBreadcrumbs aria-label="breadcrumb">
        <Link 
        onClick={() => history.push("/")}
        >   
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Home
        </Link>
    
      {
        pathnames.map((name, index) => {
          if (name === 'detail') name = 'products' 
          products.find(item => {
            if(item._id === name)
            name = item.title
          }) 
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}` === '/detail' ? '/products' : `/${pathnames.slice(0, index + 1).join("/")}`;
          
          const isLast = index === pathnames.length - 1;
          return isLast ? (
            <Typography key={name}>{name}</Typography>
          ) : (
            <Link key={name} onClick={() => history.push(routeTo)}>
              {name}
            </Link>
          );
        })
      }
    </MUIBreadcrumbs>
  );
};

export default withRouter(Breadcrumbs);