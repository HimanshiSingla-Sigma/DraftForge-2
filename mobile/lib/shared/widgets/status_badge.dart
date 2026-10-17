import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';

enum BadgeVariant {
  neutral,
  success,
  error,
  warning,
  info,
}

class StatusBadge extends StatelessWidget {
  final String label;
  final BadgeVariant variant;
  final IconData? icon;

  const StatusBadge({
    super.key,
    required this.label,
    this.variant = BadgeVariant.neutral,
    this.icon,
  });

  factory StatusBadge.fromStatus(String status) {
    final s = status.toUpperCase();
    if (s == 'PASS' || s == 'SATISFIED' || s == 'GRADED' || s == 'ACCEPTED' || s == 'SUBMITTED') {
      return StatusBadge(label: status, variant: BadgeVariant.success);
    } else if (s == 'FAIL' || s == 'CRITICAL' || s == 'EXPIRED' || s == 'REJECTED') {
      return StatusBadge(label: status, variant: BadgeVariant.error);
    } else if (s == 'PARTIAL' || s == 'HIGH' || s == 'WARNING' || s == 'PENDING') {
      return StatusBadge(label: status, variant: BadgeVariant.warning);
    } else if (s == 'DRAFT' || s == 'IN_PROGRESS') {
      return StatusBadge(label: status, variant: BadgeVariant.info);
    }
    return StatusBadge(label: status, variant: BadgeVariant.neutral);
  }

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color border;
    Color text;

    switch (variant) {
      case BadgeVariant.success:
        bg = AppColors.successLight;
        border = AppColors.successBorder;
        text = AppColors.success;
        break;
      case BadgeVariant.error:
        bg = AppColors.errorLight;
        border = AppColors.errorBorder;
        text = AppColors.error;
        break;
      case BadgeVariant.warning:
        bg = AppColors.warningLight;
        border = AppColors.warningBorder;
        text = AppColors.warning;
        break;
      case BadgeVariant.info:
        bg = AppColors.infoLight;
        border = const Color(0xFFBFDBFE);
        text = AppColors.info;
        break;
      case BadgeVariant.neutral:
      default:
        bg = AppColors.surfaceSecondary;
        border = AppColors.border;
        text = AppColors.textSecondary;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: border, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 11, color: text),
            const SizedBox(width: 4),
          ],
          Text(
            label.toUpperCase(),
            style: AppTextStyles.badge.copyWith(color: text),
          ),
        ],
      ),
    );
  }
}
