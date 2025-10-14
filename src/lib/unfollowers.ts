interface InstagramUser {
    string_list_data: {
        value: string;
        timestamp: number;
        href?: string;
    }[];
}

export function findUnfollowers(followersData: InstagramUser[], followingData: InstagramUser[]) {
    const followersSet = new Set(followersData.map(user => user.string_list_data[0].value));
    
    // Create unfollowers with their profile links
    const unfollowers = followingData
        .filter(user => !followersSet.has(user.string_list_data[0].value))
        .map(user => ({
            username: user.string_list_data[0].value,
            href: user.string_list_data[0].href,
            timestamp: user.string_list_data[0].timestamp
        }));

    return {
        unfollowers,
        totalFollowing: followingData.length,
    };
}
