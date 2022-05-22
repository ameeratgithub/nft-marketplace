import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material"
import Link from 'next/link';
export default ({ collection }) => {
    const {id, name, description, bannerUri, collectionAddress, owner, collectionType } = collection
    return <Link href={`/collections/${id}?type=${collectionType}`} passHref>
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