    <footer id="colophon" class="site-footer">
        <div class="footer-container">
            <div class="footer-content">
                <!-- Quick Links -->
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="<?php echo esc_url(home_url('/about')); ?>">About</a></li>
                        <li><a href="<?php echo esc_url(home_url('/contact')); ?>">Contact</a></li>
                        <li><a href="<?php echo esc_url(home_url('/privacy')); ?>">Privacy Policy</a></li>
                        <li><a href="<?php echo esc_url(home_url('/terms')); ?>">Terms of Service</a></li>
                    </ul>
                </div>
                
                <!-- Resources -->
                <div class="footer-section">
                    <h4>Resources</h4>
                    <ul>
                        <li><a href="<?php echo esc_url(home_url('/insights')); ?>">Market Insights</a></li>
                        <li><a href="<?php echo esc_url(home_url('/reports')); ?>">Reports</a></li>
                        <li><a href="<?php echo esc_url(home_url('/membership')); ?>">Membership</a></li>
                        <li><a href="<?php echo esc_url(home_url('/survey')); ?>">Take the Survey</a></li>
                    </ul>
                </div>
                
                <!-- Connect -->
                <div class="footer-section">
                    <h4>Connect</h4>
                    <div class="social-links">
                        <a href="https://linkedin.com/company/amaaonline" target="_blank" rel="noopener">LinkedIn</a>
                        <a href="https://twitter.com/amaaonline" target="_blank" rel="noopener">Twitter</a>
                        <a href="mailto:info@amaaonline.com">Email</a>
                    </div>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; <?php echo date('Y'); ?> Alliance of M&A Advisors. All rights reserved.</p>
            </div>
        </div>
    </footer>
</div><!-- #page -->

<?php wp_footer(); ?>

</body>
</html>
