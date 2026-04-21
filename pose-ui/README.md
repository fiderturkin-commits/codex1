# Pose Character UI

Мини-интерфейс для подготовки позы:

1. Загрузи референс-картинку.
2. Подвинь точки скелета на нужную позу.
3. Заполни описание персонажа.
4. Нажми **Экспорт пакета**.

Экспортирует:
- `pose-payload.json` — параметры позы и текст запроса.
- `pose-overlay.png` — изображение со скелетом поверх референса.

Запуск локально:

```bash
cd pose-ui
python3 -m http.server 8080
```

После запуска открой `http://localhost:8080`.

## Рендер из экспортированного payload

Чтобы сразу получить итоговую картинку через `skills/imagegen`, используй скрипт:

```bash
python3 pose-ui/scripts/render_pose.py \
  --payload /path/to/pose-payload.json \
  --reference /path/to/reference.png
```

Скрипт:
- нормализует промпт (включая частые опечатки вроде `прозраачный`),
- добавляет фиксацию прозрачного фона,
- печатает готовую команду для `skills/imagegen/scripts/image_gen.py edit`.

Фактическая генерация (нужен `OPENAI_API_KEY`):

```bash
python3 pose-ui/scripts/render_pose.py \
  --payload /path/to/pose-payload.json \
  --reference /path/to/reference.png \
  --run \
  --out outputs/pose-result.png
```

Быстрый тест на встроенном примере:

```bash
python3 pose-ui/scripts/render_pose.py \
  --payload pose-ui/examples/pose-payload.sample.json \
  --reference /path/to/reference.png
```
