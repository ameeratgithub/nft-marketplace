import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import NLink from 'next/link';
import { Grid, Link } from '@mui/material'
import { ProfileImage } from '../NFTItem';

const pages = ['Faucet', 'Collections'];

const ResponsiveAppBar = ({ profile }) => {

    console.log(profile)

    const fallBackImage = process.env.NEXT_PUBLIC_IMAGE_404

    const [anchorElNav, setAnchorElNav] = useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const onImageError = ({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src = fallBackImage
    }
    return (
        <AppBar position="static" style={{ marginBottom: '20px', backgroundColor: '#405171' }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <NLink href="/" passHref>
                        <Link
                            underline="none"
                            style={{ color: 'white' }}
                            variant="h6"
                            noWrap
                            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
                        >
                            NFT Marketplace
                        </Link>

                    </NLink>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page} onClick={handleCloseNavMenu}>
                                    <Typography textAlign="center">{page}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
                    >
                        LOGO
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <NLink key={page} href={`/${page.toLowerCase()}`} passHref>
                                <Button

                                    onClick={handleCloseNavMenu}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    {page}
                                </Button>
                            </NLink>
                        ))}
                    </Box>

                    {profile?.id && <Grid container direction="row" justifyContent="flex-end" sx={{mr:'30px'}}>
                        <Grid item>
                            <NLink href={`/users/${profile.id}`} passHref>
                                <a style={{ display: 'flex', color: 'inherit', textDecoration: 'none', alignItems: 'center' }}>
                                    <ProfileImage src={profile.picture} alt={profile.name || profile.userAddress}
                                        onError={onImageError} />
                                    <Typography variant="body2" style={{ marginLeft: '10px' }}>{profile.name || `User#${profile.id}`}</Typography>
                                </a>
                            </NLink>
                        </Grid>
                    </Grid>}
                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default ResponsiveAppBar;