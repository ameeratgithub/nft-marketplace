import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material"
import Link from 'next/link';
export default ({ collection }) => {
    const { name, description, bannerUri, collectionAddress, owner } = collection
    console.log(collection)
    return <Link href={`/collections/${collectionAddress}`} passHref>
        <Card>
            <CardActionArea>
                <CardMedia height="340" component="img" image={bannerUri} />
                <CardContent>
                    <Typography variant="h5">
                        {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    </Link>


}