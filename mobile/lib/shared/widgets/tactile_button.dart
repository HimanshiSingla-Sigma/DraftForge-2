import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';

class TactileButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;
  final Color backgroundColor;
  final Color textColor;
  final double height;
  final bool isFullWidth;

  const TactileButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.icon,
    this.backgroundColor = AppColors.primary,
    this.textColor = AppColors.textInverse,
    this.height = 52,
    this.isFullWidth = true,
  });

  @override
  State<TactileButton> createState() => _TactileButtonState();
}

class _TactileButtonState extends State<TactileButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final isDisabled = widget.onPressed == null || widget.isLoading;

    Widget content = widget.isLoading
        ? SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(widget.textColor),
            ),
          )
        : Row(
            mainAxisSize: widget.isFullWidth ? MainAxisSize.max : MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (widget.icon != null) ...[
                Icon(widget.icon, size: 18, color: widget.textColor),
                const SizedBox(width: 8),
              ],
              Text(
                widget.text,
                style: AppTextStyles.button.copyWith(color: widget.textColor),
              ),
            ],
          );

    return GestureDetector(
      onTapDown: isDisabled ? null : (_) => setState(() => _isPressed = true),
      onTapUp: isDisabled ? null : (_) => setState(() => _isPressed = false),
      onTapCancel: isDisabled ? null : () => setState(() => _isPressed = false),
      onTap: isDisabled ? null : widget.onPressed,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        height: widget.height,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        decoration: BoxDecoration(
          color: isDisabled ? AppColors.border : widget.backgroundColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.primaryDark, width: 1.5),
          boxShadow: [
            BoxShadow(
              color: AppColors.primaryDark,
              offset: Offset(0, _isPressed ? 1 : 4),
              blurRadius: 0,
            ),
          ],
        ),
        transform: Matrix4.translationValues(0, _isPressed ? 3 : 0, 0),
        child: Center(child: content),
      ),
    );
  }
}
