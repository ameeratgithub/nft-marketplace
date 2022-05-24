import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material"
import Link from 'next/link';
export default ({ collection }) => {
    const { id, name, description, bannerUri, collectionAddress, owner, collectionType } = collection
    
    const descString = description.length > 90 ? description.substring(0, 90) + "..." : description

    return <Link href={`/collections/${id}?type=${collectionType}`} passHref>
        <Card>
            <CardActionArea>
                <CardMedia height="340" component="img" image={bannerUri} />
                <CardContent sx={{ height: '70px' }}>
                    <Typography variant="h5">
                        {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {descString}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    </Link>


}