<?php
/**
 * Survey Management - Custom Post Type and Admin Interface
 */

// Register Survey Question Custom Post Type
function amaa_tmr_register_survey_question_post_type() {
    $labels = array(
        'name'                  => 'Survey Questions',
        'singular_name'         => 'Survey Question',
        'menu_name'             => 'Survey Questions',
        'name_admin_bar'        => 'Survey Question',
        'archives'              => 'Survey Question Archives',
        'attributes'            => 'Survey Question Attributes',
        'parent_item_colon'     => 'Parent Survey Question:',
        'all_items'             => 'All Survey Questions',
        'add_new_item'          => 'Add New Survey Question',
        'add_new'               => 'Add New',
        'new_item'              => 'New Survey Question',
        'edit_item'             => 'Edit Survey Question',
        'update_item'            => 'Update Survey Question',
        'view_item'             => 'View Survey Question',
        'view_items'            => 'View Survey Questions',
        'search_items'          => 'Search Survey Questions',
        'not_found'             => 'Not found',
        'not_found_in_trash'    => 'Not found in Trash',
    );

    $args = array(
        'label'                 => 'Survey Question',
        'description'           => 'Survey questions for the AM&AA Market Survey',
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'custom-fields'),
        'hierarchical'          => false,
        'public'                => false,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 25,
        'menu_icon'             => 'dashicons-feedback',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => false,
        'can_export'            => true,
        'has_archive'           => false,
        'exclude_from_search'   => true,
        'publicly_queryable'    => false,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
        'rest_base'             => 'survey-questions',
    );

    register_post_type('survey_question', $args);
}
add_action('init', 'amaa_tmr_register_survey_question_post_type', 0);

// Add custom meta boxes for survey questions
function amaa_tmr_add_survey_question_meta_boxes() {
    add_meta_box(
        'survey_question_details',
        'Question Details',
        'amaa_tmr_survey_question_details_callback',
        'survey_question',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'amaa_tmr_add_survey_question_meta_boxes');

// Meta box callback function
function amaa_tmr_survey_question_details_callback($post) {
    wp_nonce_field('amaa_tmr_survey_question_meta_box', 'amaa_tmr_survey_question_meta_box_nonce');
    
    $question_type = get_post_meta($post->ID, '_question_type', true);
    $question_required = get_post_meta($post->ID, '_question_required', true);
    $question_order = get_post_meta($post->ID, '_question_order', true);
    $question_options = get_post_meta($post->ID, '_question_options', true);
    $conditional_logic = get_post_meta($post->ID, '_conditional_logic', true);
    
    ?>
    <table class="form-table">
        <tr>
            <th scope="row">
                <label for="question_type">Question Type</label>
            </th>
            <td>
                <select name="question_type" id="question_type" style="width: 100%;">
                    <option value="multiple_choice" <?php selected($question_type, 'multiple_choice'); ?>>Multiple Choice</option>
                    <option value="text" <?php selected($question_type, 'text'); ?>>Text Input</option>
                    <option value="rating" <?php selected($question_type, 'rating'); ?>>Rating Scale</option>
                    <option value="yes_no" <?php selected($question_type, 'yes_no'); ?>>Yes/No</option>
                    <option value="number" <?php selected($question_type, 'number'); ?>>Number Input</option>
                </select>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="question_required">Required</label>
            </th>
            <td>
                <input type="checkbox" name="question_required" id="question_required" value="1" <?php checked($question_required, '1'); ?>>
                <label for="question_required">This question is required</label>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="question_order">Display Order</label>
            </th>
            <td>
                <input type="number" name="question_order" id="question_order" value="<?php echo esc_attr($question_order); ?>" min="1" style="width: 100px;">
                <p class="description">Lower numbers appear first</p>
            </td>
        </tr>
        <tr id="question_options_row" style="<?php echo ($question_type === 'multiple_choice' || $question_type === 'rating') ? '' : 'display: none;'; ?>">
            <th scope="row">
                <label for="question_options">Options</label>
            </th>
            <td>
                <textarea name="question_options" id="question_options" rows="5" style="width: 100%;"><?php echo esc_textarea($question_options); ?></textarea>
                <p class="description">
                    For multiple choice: Enter one option per line<br>
                    For rating: Enter scale (e.g., "1,2,3,4,5" or "Poor,Fair,Good,Very Good,Excellent")
                </p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="conditional_logic">Conditional Logic</label>
            </th>
            <td>
                <textarea name="conditional_logic" id="conditional_logic" rows="3" style="width: 100%;"><?php echo esc_textarea($conditional_logic); ?></textarea>
                <p class="description">JSON format for conditional display logic (optional)</p>
            </td>
        </tr>
    </table>
    
    <script>
    jQuery(document).ready(function($) {
        $('#question_type').change(function() {
            var type = $(this).val();
            if (type === 'multiple_choice' || type === 'rating') {
                $('#question_options_row').show();
            } else {
                $('#question_options_row').hide();
            }
        });
    });
    </script>
    <?php
}

// Save meta box data
function amaa_tmr_save_survey_question_meta_box($post_id) {
    if (!isset($_POST['amaa_tmr_survey_question_meta_box_nonce'])) {
        return;
    }

    if (!wp_verify_nonce($_POST['amaa_tmr_survey_question_meta_box_nonce'], 'amaa_tmr_survey_question_meta_box')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (isset($_POST['post_type']) && 'survey_question' == $_POST['post_type']) {
        if (!current_user_can('edit_page', $post_id)) {
            return;
        }
    } else {
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
    }

    // Save meta fields
    if (isset($_POST['question_type'])) {
        update_post_meta($post_id, '_question_type', sanitize_text_field($_POST['question_type']));
    }

    if (isset($_POST['question_required'])) {
        update_post_meta($post_id, '_question_required', '1');
    } else {
        update_post_meta($post_id, '_question_required', '0');
    }

    if (isset($_POST['question_order'])) {
        update_post_meta($post_id, '_question_order', intval($_POST['question_order']));
    }

    if (isset($_POST['question_options'])) {
        update_post_meta($post_id, '_question_options', sanitize_textarea_field($_POST['question_options']));
    }

    if (isset($_POST['conditional_logic'])) {
        update_post_meta($post_id, '_conditional_logic', sanitize_textarea_field($_POST['conditional_logic']));
    }
}
add_action('save_post', 'amaa_tmr_save_survey_question_meta_box');

// Add custom columns to survey questions list
function amaa_tmr_survey_question_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = $columns['title'];
    $new_columns['question_type'] = 'Question Type';
    $new_columns['question_order'] = 'Order';
    $new_columns['question_required'] = 'Required';
    $new_columns['date'] = $columns['date'];
    
    return $new_columns;
}
add_filter('manage_survey_question_posts_columns', 'amaa_tmr_survey_question_columns');

// Populate custom columns
function amaa_tmr_survey_question_column_content($column, $post_id) {
    switch ($column) {
        case 'question_type':
            $type = get_post_meta($post_id, '_question_type', true);
            echo esc_html(ucfirst(str_replace('_', ' ', $type)));
            break;
        case 'question_order':
            $order = get_post_meta($post_id, '_question_order', true);
            echo esc_html($order ?: '1');
            break;
        case 'question_required':
            $required = get_post_meta($post_id, '_question_required', true);
            echo $required ? '<span style="color: #d63638;">Required</span>' : 'Optional';
            break;
    }
}
add_action('manage_survey_question_posts_custom_column', 'amaa_tmr_survey_question_column_content', 10, 2);

// Make columns sortable
function amaa_tmr_survey_question_sortable_columns($columns) {
    $columns['question_type'] = 'question_type';
    $columns['question_order'] = 'question_order';
    $columns['question_required'] = 'question_required';
    return $columns;
}
add_filter('manage_edit-survey_question_sortable_columns', 'amaa_tmr_survey_question_sortable_columns');

// REST API endpoint for survey questions
function amaa_tmr_register_survey_questions_rest_route() {
    register_rest_route('amaa/v1', '/survey/questions', array(
        'methods' => 'GET',
        'callback' => 'amaa_tmr_get_survey_questions',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'amaa_tmr_register_survey_questions_rest_route');

// Get survey questions for REST API
function amaa_tmr_get_survey_questions($request) {
    $args = array(
        'post_type' => 'survey_question',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'meta_key' => '_question_order',
        'orderby' => 'meta_value_num',
        'order' => 'ASC',
    );

    $questions = get_posts($args);
    $formatted_questions = array();

    foreach ($questions as $question) {
        $question_type = get_post_meta($question->ID, '_question_type', true);
        $question_required = get_post_meta($question->ID, '_question_required', true);
        $question_options = get_post_meta($question->ID, '_question_options', true);
        $conditional_logic = get_post_meta($question->ID, '_conditional_logic', true);

        $formatted_questions[] = array(
            'id' => $question->ID,
            'title' => $question->post_title,
            'content' => $question->post_content,
            'type' => $question_type,
            'required' => $question_required === '1',
            'options' => $question_options ? explode("\n", $question_options) : array(),
            'conditional_logic' => $conditional_logic ? json_decode($conditional_logic, true) : null,
        );
    }

    return rest_ensure_response($formatted_questions);
}

// REST API endpoint for survey submission
function amaa_tmr_register_survey_submission_rest_route() {
    register_rest_route('amaa/v1', '/survey/submit', array(
        'methods' => 'POST',
        'callback' => 'amaa_tmr_submit_survey_response',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'amaa_tmr_register_survey_submission_rest_route');

// Submit survey response
function amaa_tmr_submit_survey_response($request) {
    $responses = $request->get_param('responses');
    $user_id = $request->get_param('user_id');
    
    if (!$responses || !$user_id) {
        return new WP_Error('missing_data', 'Missing required data', array('status' => 400));
    }

    // Here you would integrate with Supabase
    // For now, we'll store in WordPress options as a placeholder
    $survey_responses = get_option('amaa_survey_responses', array());
    $survey_responses[] = array(
        'user_id' => $user_id,
        'responses' => $responses,
        'timestamp' => current_time('mysql'),
    );
    
    update_option('amaa_survey_responses', $survey_responses);

    return rest_ensure_response(array(
        'success' => true,
        'message' => 'Survey response submitted successfully',
    ));
}
