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

const pages = ['Faucet', 'Collections', 'Marketplace','Auctions'];

const ResponsiveAppBar = ({ profile }) => {


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
                    <Grid container direction="row" alignItems="center">
                        <Grid item md={2} sm={4}>
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
                        </Grid>
                        <Grid item md={8}>
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
                        </Grid>
                        {profile?.id &&
                            <Grid item md={2}>
                                <NLink href={`/users/${profile.id}`} passHref>
                                    <a style={{ display: 'flex', color: 'inherit', textDecoration: 'none', alignItems: 'center' }}>
                                        <ProfileImage src={profile.picture} alt={profile.name || profile.userAddress}
                                            onError={onImageError} />
                                        <Typography variant="body2" style={{ marginLeft: '10px' }}>{profile.name || `User#${profile.id}`}</Typography>
                                    </a>
                                </NLink>
                            </Grid>
                        }
                    </Grid>


                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default ResponsiveAppBar;