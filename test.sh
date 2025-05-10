#!/bin/bash

# Base URLs
USERS_URL="http://localhost:3000/api/users"
POSTS_URL="http://localhost:3000/api/posts"
LIKES_URL="http://localhost:3000/api/likes"
FOLLOWS_URL="http://localhost:3000/api/follows"
HASHTAGS_URL="http://localhost:3000/api/hashtags"
FEED_URL="http://localhost:3000/api/feed"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Store user session data
current_user_id=""
current_user_token=""

# Function to print section headers
print_header() {
    echo -e "\n${GREEN}=== $1 ===${NC}"
}

# Function to make API requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    echo "Request: $method $endpoint"
    if [ -n "$data" ]; then
        echo "Data: $data"
    fi
    
    echo "Response:"
    if [ "$method" = "GET" ]; then
        if [ -n "$current_user_id" ]; then
            curl -s -X $method "$endpoint" -H "userId: $current_user_id"
        else
            curl -s -X $method "$endpoint"
        fi
    else
        if [ -n "$current_user_id" ]; then
            curl -s -X $method "$endpoint" -H "Content-Type: application/json" -H "userId: $current_user_id" -d "$data"
        else
            curl -s -X $method "$endpoint" -H "Content-Type: application/json" -d "$data"
        fi
    fi
    echo -e "\n"
}

# Mock auth for testing (since we're not implementing real auth here)
simulate_login() {
    print_header "Simulating login"
    read -p "Enter user ID to simulate auth with: " user_id
    current_user_id=$user_id
    current_user_token="mock_token_for_user_$user_id" # In a real app, this would be a JWT
    echo "You are now authenticated as user $current_user_id"
}

# User-related functions
test_get_all_users() {
    print_header "Testing GET all users"
    make_request "GET" "$USERS_URL"
}

test_get_user() {
    print_header "Testing GET user by ID"
    read -p "Enter user ID: " user_id
    make_request "GET" "$USERS_URL/$user_id"
}

test_create_user() {
    print_header "Testing POST create user"
    read -p "Enter first name: " firstName
    read -p "Enter last name: " lastName
    read -p "Enter email: " email
    
    local user_data=$(cat <<EOF
{
    "firstName": "$firstName",
    "lastName": "$lastName",
    "email": "$email"
}
EOF
)
    make_request "POST" "$USERS_URL" "$user_data"
}

test_update_user() {
    print_header "Testing PUT update user"
    read -p "Enter user ID to update: " user_id
    read -p "Enter new first name (press Enter to keep current): " firstName
    read -p "Enter new last name (press Enter to keep current): " lastName
    read -p "Enter new email (press Enter to keep current): " email
    
    local update_data="{"
    local has_data=false
    
    if [ -n "$firstName" ]; then
        update_data+="\"firstName\": \"$firstName\""
        has_data=true
    fi
    
    if [ -n "$lastName" ]; then
        if [ "$has_data" = true ]; then
            update_data+=","
        fi
        update_data+="\"lastName\": \"$lastName\""
        has_data=true
    fi
    
    if [ -n "$email" ]; then
        if [ "$has_data" = true ]; then
            update_data+=","
        fi
        update_data+="\"email\": \"$email\""
        has_data=true
    fi
    
    update_data+="}"
    
    make_request "PUT" "$USERS_URL/$user_id" "$update_data"
}

test_delete_user() {
    print_header "Testing DELETE user"
    read -p "Enter user ID to delete: " user_id
    make_request "DELETE" "$USERS_URL/$user_id"
}

test_get_user_followers() {
    print_header "Testing GET user followers"
    read -p "Enter user ID to get followers: " user_id
    read -p "Enter limit (or press Enter for default): " limit
    read -p "Enter offset (or press Enter for default): " offset
    
    local params="?"
    if [ -n "$limit" ]; then
        params+="limit=$limit&"
    fi
    if [ -n "$offset" ]; then
        params+="offset=$offset"
    fi
    
    make_request "GET" "$USERS_URL/$user_id/followers$params"
}

test_get_user_activity() {
    print_header "Testing GET user activity"
    read -p "Enter user ID to get activity: " user_id
    read -p "Enter activity types (comma-separated, e.g., post,like,follow): " types
    read -p "Enter start date (YYYY-MM-DD or press Enter to skip): " startDate
    read -p "Enter end date (YYYY-MM-DD or press Enter to skip): " endDate
    read -p "Enter page number (or press Enter for default): " page
    read -p "Enter limit (or press Enter for default): " limit
    
    local params="?"
    local has_params=false
    
    if [ -n "$types" ]; then
        IFS=',' read -ra TYPE_ARRAY <<< "$types"
        for type in "${TYPE_ARRAY[@]}"; do
            params+="types=$type&"
        done
        has_params=true
    fi
    
    if [ -n "$startDate" ]; then
        params+="startDate=$startDate&"
        has_params=true
    fi
    
    if [ -n "$endDate" ]; then
        params+="endDate=$endDate&"
        has_params=true
    fi
    
    if [ -n "$page" ]; then
        params+="page=$page&"
        has_params=true
    fi
    
    if [ -n "$limit" ]; then
        params+="limit=$limit"
        has_params=true
    fi
    
    # Remove trailing '&' or '?' if no parameters were added
    params=${params%&}
    if [ "$params" = "?" ]; then
        params=""
    fi
    
    make_request "GET" "$USERS_URL/$user_id/activity$params"
}

# Post-related functions
test_get_all_posts() {
    print_header "Testing GET all posts"
    read -p "Enter limit (or press Enter for default): " limit
    read -p "Enter offset (or press Enter for default): " offset
    
    local params="?"
    if [ -n "$limit" ]; then
        params+="limit=$limit&"
    fi
    if [ -n "$offset" ]; then
        params+="offset=$offset"
    fi
    
    # Remove trailing '&' or '?' if no parameters were added
    params=${params%&}
    if [ "$params" = "?" ]; then
        params=""
    fi
    
    make_request "GET" "$POSTS_URL$params"
}

test_get_post() {
    print_header "Testing GET post by ID"
    read -p "Enter post ID: " post_id
    make_request "GET" "$POSTS_URL/$post_id"
}

test_create_post() {
    print_header "Testing POST create post"
    if [ -z "$current_user_id" ]; then
        echo -e "${RED}You need to simulate login first!${NC}"
        return
    fi
    
    read -p "Enter post content: " content
    read -p "Enter hashtags (comma-separated, e.g., tech,news): " hashtags_input
    
    # Process hashtags if provided
    local hashtags_json="[]"
    if [ -n "$hashtags_input" ]; then
        hashtags_json="["
        IFS=',' read -ra TAGS <<< "$hashtags_input"
        for i in "${!TAGS[@]}"; do
            if [ $i -gt 0 ]; then
                hashtags_json+=","
            fi
            hashtags_json+="\"${TAGS[$i]}\""
        done
        hashtags_json+="]"
    fi
    
    local post_data=$(cat <<EOF
{
    "content": "$content",
    "hashtags": $hashtags_json
}
EOF
)
    make_request "POST" "$POSTS_URL" "$post_data"
}

test_update_post() {
    print_header "Testing PUT update post"
    if [ -z "$current_user_id" ]; then
        echo -e "${RED}You need to simulate login first!${NC}"
        return
    fi
    
    read -p "Enter post ID to update: " post_id
    read -p "Enter new content (or press Enter to keep current): " content
    read -p "Enter new hashtags (comma-separated or press Enter to keep current): " hashtags_input
    
    local update_data="{"
    local has_data=false
    
    if [ -n "$content" ]; then
        update_data+="\"content\": \"$content\""
        has_data=true
    fi
    
    if [ -n "$hashtags_input" ]; then
        if [ "$has_data" = true ]; then
            update_data+=","
        fi
        
        update_data+="\"hashtags\": ["
        IFS=',' read -ra TAGS <<< "$hashtags_input"
        for i in "${!TAGS[@]}"; do
            if [ $i -gt 0 ]; then
                update_data+=","
            fi
            update_data+="\"${TAGS[$i]}\""
        done
        update_data+="]"
        has_data=true
    fi
    
    update_data+="}"
    
    make_request "PUT" "$POSTS_URL/$post_id" "$update_data"
}

test_delete_post() {
    print_header "Testing DELETE post"
    if [ -z "$current_user_id" ]; then
        echo -e "${RED}You need to simulate login first!${NC}"
        return
    fi
    
    read -p "Enter post ID to delete: " post_id
    make_request "DELETE" "$POSTS_URL/$post_id"
}

test_get_posts_by_hashtag() {
    print_header "Testing GET posts by hashtag"
    read -p "Enter hashtag (without #): " tag
    read -p "Enter limit (or press Enter for default): " limit
    read -p "Enter offset (or press Enter for default): " offset
    
    local params="?"
    if [ -n "$limit" ]; then
        params+="limit=$limit&"
    fi
    if [ -n "$offset" ]; then
        params+="offset=$offset"
    fi
    
    # Remove trailing '&' or '?' if no parameters were added
    params=${params%&}
    if [ "$params" = "?" ]; then
        params=""
    fi
    
    make_request "GET" "$POSTS_URL/hashtag/$tag$params"
}

# Like-related functions
test_get_all_likes() {
    print_header "Testing GET all likes"
    read -p "Enter limit (or press Enter for default): " limit
    read -p "Enter offset (or press Enter for default): " offset
    
    local params="?"
    if [ -n "$limit" ]; then
        params+="limit=$limit&"
    fi
    if [ -n "$offset" ]; then
        params+="offset=$offset"
    fi
    
    # Remove trailing '&' or '?' if no parameters were added
    params=${params%&}
    if [ "$params" = "?" ]; then
        params=""
    fi
    
    make_request "GET" "$LIKES_URL$params"
}

test_get_like() {
    print_header "Testing GET like by ID"
    read -p "Enter like ID: " like_id
    make_request "GET" "$LIKES_URL/$like_id"
}

test_create_like() {
    print_header "Testing POST create like"
    if [ -z "$current_user_id" ]; then
        echo -e "${RED}You need to simulate login first!${NC}"
        return
    fi
    
    read -p "Enter post ID to like: " post_id
    
    local like_data=$(cat <<EOF
{
    "postId": $post_id
}
EOF
)
    make_request "POST" "$LIKES_URL" "$like_data"
}

test_delete_like() {
    print_header "Testing DELETE like"
    if [ -z "$current_user_id" ]; then
        echo -e "${RED}You need to simulate login first!${NC}"
        return
    fi
    
    read -p "Enter like ID to delete: " like_id
    make_request "DELETE" "$LIKES_URL/$like_id"
}

# Follow-related functions
test_get_all_follows() {
    print_header "Testing GET all follows"
    read -p "Enter limit (or press Enter for default): " limit
    read -p "Enter offset (or press Enter for default): " offset
    
    local params="?"
    if [ -n "$limit" ]; then
        params+="limit=$limit&"
    fi
    if [ -n "$offset" ]; then
        params+="offset=$offset"
    fi
    
    # Remove trailing '&' or '?' if no parameters were added
    params=${params%&}
    if [ "$params" = "?" ]; then
        params=""
    fi
    
    make_request "GET" "$FOLLOWS_URL$params"
}

test_get_follow() {
    print_header "Testing GET follow by ID"
    read -p "Enter follow ID: " follow_id
    make_request "GET" "$FOLLOWS_URL/$follow_id"
}

test_create_follow() {
    print_header "Testing POST create follow"
    if [ -z "$current_user_id" ]; then
        echo -e "${RED}You need to simulate login first!${NC}"
        return
    fi
    
    read -p "Enter user ID to follow: " following_id
    
    local follow_data=$(cat <<EOF
{
    "followingId": $following_id
}
EOF
)
    make_request "POST" "$FOLLOWS_URL" "$follow_data"
}

test_delete_follow() {
    print_header "Testing DELETE follow"
    if [ -z "$current_user_id" ]; then
        echo -e "${RED}You need to simulate login first!${NC}"
        return
    fi
    
    read -p "Enter follow ID to delete: " follow_id
    make_request "DELETE" "$FOLLOWS_URL/$follow_id"
}

# Hashtag-related functions
test_get_all_hashtags() {
    print_header "Testing GET all hashtags"
    read -p "Enter limit (or press Enter for default): " limit
    read -p "Enter offset (or press Enter for default): " offset
    
    local params="?"
    if [ -n "$limit" ]; then
        params+="limit=$limit&"
    fi
    if [ -n "$offset" ]; then
        params+="offset=$offset"
    fi
    
    # Remove trailing '&' or '?' if no parameters were added
    params=${params%&}
    if [ "$params" = "?" ]; then
        params=""
    fi
    
    make_request "GET" "$HASHTAGS_URL$params"
}

test_get_hashtag() {
    print_header "Testing GET hashtag by ID"
    read -p "Enter hashtag ID: " hashtag_id
    make_request "GET" "$HASHTAGS_URL/$hashtag_id"
}

test_create_hashtag() {
    print_header "Testing POST create hashtag"
    read -p "Enter hashtag (without #): " tag
    
    local hashtag_data=$(cat <<EOF
{
    "tag": "$tag"
}
EOF
)
    make_request "POST" "$HASHTAGS_URL" "$hashtag_data"
}

test_update_hashtag() {
    print_header "Testing PUT update hashtag"
    read -p "Enter hashtag ID to update: " hashtag_id
    read -p "Enter new tag name (without #): " tag
    
    local update_data=$(cat <<EOF
{
    "tag": "$tag"
}
EOF
)
    make_request "PUT" "$HASHTAGS_URL/$hashtag_id" "$update_data"
}

test_delete_hashtag() {
    print_header "Testing DELETE hashtag"
    read -p "Enter hashtag ID to delete: " hashtag_id
    make_request "DELETE" "$HASHTAGS_URL/$hashtag_id"
}

test_search_hashtags() {
    print_header "Testing GET search hashtags"
    read -p "Enter search query: " query
    read -p "Enter limit (or press Enter for default): " limit
    read -p "Enter offset (or press Enter for default): " offset
    
    local params="?q=$query"
    if [ -n "$limit" ]; then
        params+="&limit=$limit"
    fi
    if [ -n "$offset" ]; then
        params+="&offset=$offset"
    fi
    
    make_request "GET" "$HASHTAGS_URL/search$params"
}

test_get_popular_hashtags() {
    print_header "Testing GET popular hashtags"
    read -p "Enter limit (or press Enter for default): " limit
    read -p "Enter offset (or press Enter for default): " offset
    
    local params="?"
    if [ -n "$limit" ]; then
        params+="limit=$limit&"
    fi
    if [ -n "$offset" ]; then
        params+="offset=$offset"
    fi
    
    # Remove trailing '&' or '?' if no parameters were added
    params=${params%&}
    if [ "$params" = "?" ]; then
        params=""
    fi
    
    make_request "GET" "$HASHTAGS_URL/popular$params"
}

# Feed-related functions
test_get_user_feed() {
    print_header "Testing GET user feed"
    if [ -z "$current_user_id" ]; then
        echo -e "${RED}You need to simulate login first!${NC}"
        return
    fi
    
    read -p "Enter limit (or press Enter for default): " limit
    read -p "Enter offset (or press Enter for default): " offset
    
    local params="?"
    if [ -n "$limit" ]; then
        params+="limit=$limit&"
    fi
    if [ -n "$offset" ]; then
        params+="offset=$offset"
    fi
    
    # Remove trailing '&' or '?' if no parameters were added
    params=${params%&}
    if [ "$params" = "?" ]; then
        params=""
    fi
    
    make_request "GET" "$FEED_URL$params"
}

# Special endpoints test menu
show_special_endpoints_menu() {
    echo -e "\n${GREEN}Special Endpoints Menu${NC}"
    echo "1. Get user feed"
    echo "2. Get posts by hashtag"
    echo "3. Get user followers"
    echo "4. Get user activity"
    echo "5. Search hashtags"
    echo "6. Get popular hashtags"
    echo "7. Back to main menu"
    echo -n "Enter your choice (1-7): "
}

# Entity submenus
show_users_menu() {
    echo -e "\n${GREEN}Users Menu${NC}"
    echo "1. Get all users"
    echo "2. Get user by ID"
    echo "3. Create new user"
    echo "4. Update user"
    echo "5. Delete user"
    echo "6. Back to main menu"
    echo -n "Enter your choice (1-6): "
}

show_posts_menu() {
    echo -e "\n${GREEN}Posts Menu${NC}"
    echo "1. Get all posts"
    echo "2. Get post by ID"
    echo "3. Create new post"
    echo "4. Update post"
    echo "5. Delete post"
    echo "6. Back to main menu"
    echo -n "Enter your choice (1-6): "
}

show_likes_menu() {
    echo -e "\n${GREEN}Likes Menu${NC}"
    echo "1. Get all likes"
    echo "2. Get like by ID"
    echo "3. Create new like"
    echo "4. Delete like"
    echo "5. Back to main menu"
    echo -n "Enter your choice (1-5): "
}

show_follows_menu() {
    echo -e "\n${GREEN}Follows Menu${NC}"
    echo "1. Get all follows"
    echo "2. Get follow by ID"
    echo "3. Create new follow"
    echo "4. Delete follow"
    echo "5. Back to main menu"
    echo -n "Enter your choice (1-5): "
}

show_hashtags_menu() {
    echo -e "\n${GREEN}Hashtags Menu${NC}"
    echo "1. Get all hashtags"
    echo "2. Get hashtag by ID"
    echo "3. Create new hashtag"
    echo "4. Update hashtag"
    echo "5. Delete hashtag"
    echo "6. Back to main menu"
    echo -n "Enter your choice (1-6): "
}

# Main menu
show_main_menu() {
    echo -e "\n${GREEN}API Testing Menu${NC}"
    echo "1. Users"
    echo "2. Posts"
    echo "3. Likes"
    echo "4. Follows"
    echo "5. Hashtags"
    echo "6. Special Endpoints"
    echo "7. Simulate Login"
    echo "8. Exit"
    echo -n "Enter your choice (1-8): "
}

# Main loop
while true; do
    show_main_menu
    read choice
    case $choice in
        1)
            while true; do
                show_users_menu
                read user_choice
                case $user_choice in
                    1) test_get_all_users ;;
                    2) test_get_user ;;
                    3) test_create_user ;;
                    4) test_update_user ;;
                    5) test_delete_user ;;
                    6) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        2)
            while true; do
                show_posts_menu
                read post_choice
                case $post_choice in
                    1) test_get_all_posts ;;
                    2) test_get_post ;;
                    3) test_create_post ;;
                    4) test_update_post ;;
                    5) test_delete_post ;;
                    6) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        3)
            while true; do
                show_likes_menu
                read like_choice
                case $like_choice in
                    1) test_get_all_likes ;;
                    2) test_get_like ;;
                    3) test_create_like ;;
                    4) test_delete_like ;;
                    5) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        4)
            while true; do
                show_follows_menu
                read follow_choice
                case $follow_choice in
                    1) test_get_all_follows ;;
                    2) test_get_follow ;;
                    3) test_create_follow ;;
                    4) test_delete_follow ;;
                    5) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        5)
            while true; do
                show_hashtags_menu
                read hashtag_choice
                case $hashtag_choice in
                    1) test_get_all_hashtags ;;
                    2) test_get_hashtag ;;
                    3) test_create_hashtag ;;
                    4) test_update_hashtag ;;
                    5) test_delete_hashtag ;;
                    6) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        6)
            while true; do
                show_special_endpoints_menu
                read special_choice
                case $special_choice in
                    1) test_get_user_feed ;;
                    2) test_get_posts_by_hashtag ;;
                    3) test_get_user_followers ;;
                    4) test_get_user_activity ;;
                    5) test_search_hashtags ;;
                    6) test_get_popular_hashtags ;;
                    7) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        7) simulate_login ;;
        8) echo "Exiting..."; exit 0 ;;
        *) echo "Invalid choice. Please try again." ;;
    esac
done